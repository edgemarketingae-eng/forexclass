# Edge Learning web app (React + Vite)

The live site at the repo root is built from this folder.

    cd web
    npm install
    ln -s ../../s public/s     # slides live in the repo root
    npm run build
    cp -r dist/* ..            # copy the build to the site root, then commit

Classes, slides and Drive / YouTube links are in `src/data.js`.
Offline support: `src/sw-template.js` (service worker, written to sw.js on build).
