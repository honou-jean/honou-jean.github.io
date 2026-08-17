@echo off
rem Lance le portfolio en local sur http://localhost:8420
rem A utiliser pour l'espace enseignant/etudiant : ouvrir le site directement
rem en double-cliquant les fichiers .html (file://) empeche la session de
rem rester connectee dans certains navigateurs. Ce script sert le site via
rem un vrai serveur local, ce qui evite le probleme.
cd /d "%~dp0"
start "Portfolio - serveur local" /min cmd /c "python -m http.server 8420"
timeout /t 2 /nobreak >nul
start "" "http://localhost:8420/index.html"
