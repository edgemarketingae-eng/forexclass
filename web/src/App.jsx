import { useEffect } from "react";
import { CLASSES } from "./data.js";
import { useRoute } from "./store.jsx";
import { BottomNav, Footer, Header, OfflineBanner, Toast } from "./ui.jsx";
import { Classes, Home, Learning, Outline, Saved } from "./pages.jsx";
import Room from "./Room.jsx";

export default function App() {
  const route = useRoute();
  const cm = /^class-(\d+)$/.exec(route);
  const n = cm ? +cm[1] : 0;
  const inRoom = n >= 1 && n <= CLASSES.length;
  const mm = /^classes-(\d)$/.exec(route);

  useEffect(() => { if (!inRoom) window.scrollTo(0, 0); }, [route, inRoom]);
  useEffect(() => {
    document.title = inRoom ? `${CLASSES[n - 1].t} · Edge Learning` : "Edge Learning";
  }, [inRoom, n]);

  let page;
  if (inRoom) page = <Room n={n} />;
  else if (route === "classes" || mm) page = <Classes key={route} initialModule={mm ? +mm[1] - 1 : -1} />;
  else if (route === "outline") page = <Outline />;
  else if (route === "learning") page = <Learning />;
  else if (route === "saved") page = <Saved />;
  else page = <Home />;

  return (
    <div className={"app" + (inRoom ? " in-room" : "")}>
      <OfflineBanner />
      {!inRoom && <Header />}
      <main>{page}</main>
      {!inRoom && <Footer />}
      {!inRoom && <BottomNav />}
      <Toast />
    </div>
  );
}
