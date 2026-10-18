package ae.edgeacademy.learn;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

/**
 * Edge Academy: a full-screen app around the Edge Learning class site.
 * The site stays the single source of truth, so new classes appear without an app update.
 * Third-party cookies are enabled so the embedded Google Drive player can stream inside the app.
 */
public class MainActivity extends Activity {

    private static final String HOME_URL = "https://edgemarketingae-eng.github.io/forexclass/";
    private static final String SITE_HOST = "edgemarketingae-eng.github.io";
    private static final String SITE_PATH = "/forexclass";

    private static final int DEEP = Color.parseColor("#021A1A");
    private static final int GREEN = Color.parseColor("#08E186");
    private static final int MUTED = Color.parseColor("#5A6E69");

    private FrameLayout root;
    private WebView web;
    private ProgressBar progress;
    private LinearLayout offline;
    private FrameLayout splash;
    private View customView;
    private WebChromeClient.CustomViewCallback customCallback;
    private int savedOrientation;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.WHITE);
        root.setFitsSystemWindows(true);

        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));

        progress = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progress.setMax(100);
        progress.setProgressTintList(android.content.res.ColorStateList.valueOf(GREEN));
        progress.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.TRANSPARENT));
        FrameLayout.LayoutParams pp = new FrameLayout.LayoutParams(-1, dp(3));
        pp.gravity = Gravity.TOP;
        root.addView(progress, pp);

        offline = buildOfflineView();
        offline.setVisibility(View.GONE);
        root.addView(offline, new FrameLayout.LayoutParams(-1, -1));

        splash = buildSplash();
        root.addView(splash, new FrameLayout.LayoutParams(-1, -1));

        setContentView(root);
        setupWebView();

        if (savedInstanceState != null) {
            web.restoreState(savedInstanceState);
            splash.setVisibility(View.GONE);
        } else {
            web.loadUrl(startUrl(getIntent()));
        }
    }

    /** A link to a page of the class site (e.g. .../forexclass/#class-3) opens that page; anything else opens home. */
    private String startUrl(Intent intent) {
        Uri data = intent == null ? null : intent.getData();
        if (data != null && isOwnSite(data)) return data.toString();
        return HOME_URL;
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        Uri data = intent.getData();
        if (data != null && isOwnSite(data)) {
            exitFullscreen();
            offline.setVisibility(View.GONE);
            web.loadUrl(data.toString());
        }
    }

    private void setupWebView() {
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " EdgeAcademyApp/1.0");

        CookieManager cookies = CookieManager.getInstance();
        cookies.setAcceptCookie(true);
        cookies.setAcceptThirdPartyCookies(web, true); // lets the Google Drive player stream inside the app

        web.setOverScrollMode(View.OVER_SCROLL_NEVER);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (!request.isForMainFrame()) return false;
                Uri uri = request.getUrl();
                if (isOwnSite(uri)) return false;
                openExternally(uri);
                return true;
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                if (splash.getVisibility() == View.VISIBLE) {
                    splash.animate().alpha(0f).setDuration(250).withEndAction(() -> splash.setVisibility(View.GONE)).start();
                }
                CookieManager.getInstance().flush();
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    offline.setVisibility(View.VISIBLE);
                    splash.setVisibility(View.GONE);
                    scheduleAutoRetry();
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                progress.setProgress(newProgress);
                progress.setVisibility(newProgress >= 100 ? View.GONE : View.VISIBLE);
            }

            // Full-screen video from the Drive / YouTube player
            @Override
            public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) {
                    callback.onCustomViewHidden();
                    return;
                }
                customView = view;
                customCallback = callback;
                savedOrientation = getRequestedOrientation();
                root.setFitsSystemWindows(false);
                root.addView(view, new FrameLayout.LayoutParams(-1, -1));
                view.setBackgroundColor(Color.BLACK);
                web.setVisibility(View.GONE);
                setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
                hideSystemBars(true);
            }

            @Override
            public void onHideCustomView() {
                exitFullscreen();
            }
        });
    }

    /* While the offline screen shows, quietly retry every few seconds so the app recovers by itself
       when the connection comes back. */
    private final android.os.Handler retryHandler = new android.os.Handler(android.os.Looper.getMainLooper());
    private final Runnable autoRetry = new Runnable() {
        @Override public void run() {
            if (offline.getVisibility() != View.VISIBLE || isFinishing()) return;
            if (isOnline()) retryLoad(); else retryHandler.postDelayed(this, 4000);
        }
    };

    private void scheduleAutoRetry() {
        retryHandler.removeCallbacks(autoRetry);
        retryHandler.postDelayed(autoRetry, 4000);
    }

    @SuppressWarnings("deprecation")
    private boolean isOnline() {
        android.net.ConnectivityManager cm = (android.net.ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
        if (cm == null) return true;
        android.net.NetworkInfo ni = cm.getActiveNetworkInfo();
        return ni != null && ni.isConnected();
    }

    private void retryLoad() {
        offline.setVisibility(View.GONE);
        String current = web.getUrl();
        if (current == null || current.startsWith("about:") || current.startsWith("data:") || current.startsWith("chrome-error:")) {
            web.loadUrl(startUrl(getIntent()));
        } else {
            web.reload();
        }
    }

    private void exitFullscreen() {
        if (customView == null) return;
        root.removeView(customView);
        customView = null;
        if (customCallback != null) customCallback.onCustomViewHidden();
        customCallback = null;
        web.setVisibility(View.VISIBLE);
        root.setFitsSystemWindows(true);
        setRequestedOrientation(savedOrientation);
        hideSystemBars(false);
    }

    @SuppressWarnings("deprecation")
    private void hideSystemBars(boolean hide) {
        View d = getWindow().getDecorView();
        if (hide) {
            d.setSystemUiVisibility(View.SYSTEM_UI_FLAG_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        } else {
            d.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
    }

    private boolean isOwnSite(Uri uri) {
        String host = uri.getHost();
        String path = uri.getPath() == null ? "" : uri.getPath();
        return SITE_HOST.equalsIgnoreCase(host) && path.startsWith(SITE_PATH);
    }

    private void openExternally(Uri uri) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, uri));
        } catch (ActivityNotFoundException ignored) {
            // nothing on the phone can open it; stay in the app
        }
    }

    @Override
    public void onBackPressed() {
        if (customView != null) {
            exitFullscreen();
        } else if (offline.getVisibility() == View.VISIBLE) {
            super.onBackPressed();
        } else if (web.canGoBack()) {
            web.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        retryHandler.removeCallbacks(autoRetry);
        if (web != null) {
            web.stopLoading();
            web.destroy();
        }
        super.onDestroy();
    }

    /* ---------- views ---------- */

    private FrameLayout buildSplash() {
        FrameLayout f = new FrameLayout(this);
        f.setBackgroundColor(Color.WHITE);
        f.setClickable(true);
        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.edge_logo);
        logo.setAdjustViewBounds(true);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(dp(200), -2);
        lp.gravity = Gravity.CENTER;
        f.addView(logo, lp);
        return f;
    }

    private LinearLayout buildOfflineView() {
        LinearLayout l = new LinearLayout(this);
        l.setOrientation(LinearLayout.VERTICAL);
        l.setGravity(Gravity.CENTER);
        l.setBackgroundColor(Color.WHITE);
        l.setPadding(dp(32), dp(32), dp(32), dp(32));
        l.setClickable(true);

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.edge_logo);
        logo.setAdjustViewBounds(true);
        LinearLayout.LayoutParams llp = new LinearLayout.LayoutParams(dp(160), -2);
        llp.bottomMargin = dp(32);
        l.addView(logo, llp);

        TextView t = new TextView(this);
        t.setText(R.string.offline_title);
        t.setTextColor(DEEP);
        t.setTextSize(22);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setGravity(Gravity.CENTER);
        l.addView(t);

        TextView b = new TextView(this);
        b.setText(R.string.offline_body);
        b.setTextColor(MUTED);
        b.setTextSize(15);
        b.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams blp = new LinearLayout.LayoutParams(-2, -2);
        blp.topMargin = dp(8);
        blp.bottomMargin = dp(24);
        l.addView(b, blp);

        Button retry = new Button(this);
        retry.setText(R.string.retry);
        retry.setAllCaps(false);
        retry.setTextColor(DEEP);
        retry.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(GREEN);
        bg.setCornerRadius(dp(999));
        retry.setBackground(bg);
        retry.setPadding(dp(28), 0, dp(28), 0);
        retry.setOnClickListener(v -> retryLoad());
        l.addView(retry, new LinearLayout.LayoutParams(-2, dp(48)));
        return l;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
