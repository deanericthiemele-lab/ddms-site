#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DDMS — Desactivation de l'authentification sur toutes les pages HTML.

Principe : injecter, tout en haut du <head>, un micro-script qui pose
tous les jetons de role dans sessionStorage ET localStorage AVANT que
les gardes des pages ne s'executent. Aucune garde n'est supprimee :
elles trouvent simplement toujours un jeton valide.

USAGE  (a lancer a la racine du depot ddms-site)
  python ddms_noauth.py            -> simulation, n'ecrit rien
  python ddms_noauth.py --apply    -> applique
  python ddms_noauth.py --undo     -> retire l'injection (retour a l'identique)
"""

import sys, glob, io

MARK_START = "<!-- DDMS-NOAUTH START -->"
MARK_END   = "<!-- DDMS-NOAUTH END -->"

# Jetons observes dans index.html (fonctions checkPassword*)
TOKENS = {
    "userRole":      "admin",
    "prodRole":      "admin",
    "nocRole":       "superadmin",
    "vsat_unlocked": "1",
    "bidRole":       "adminbid",
    "comiteRole":    "ok",
    "savRole":       "admin",
}

_pairs = ",".join("'%s':'%s'" % (k, v) for k, v in TOKENS.items())

# Important : BLOCK ne se termine PAS par un saut de ligne,
# pour que --undo restitue le fichier a l'octet pres.
BLOCK = (
    MARK_START + "\n"
    "<script>(function(){var r={" + _pairs + "};"
    "for(var k in r){"
    "try{sessionStorage.setItem(k,r[k]);}catch(e){}"
    "try{localStorage.setItem(k,r[k]);}catch(e){}"
    "}})();</script>\n"
    + MARK_END
)


def find_head(txt):
    """Index juste apres la balise <head...> ouvrante, ou -1."""
    i = txt.lower().find("<head")
    if i == -1:
        return -1
    j = txt.find(">", i)
    return -1 if j == -1 else j + 1


def strip_block(txt):
    """Retire toutes les injections existantes, sans toucher au reste."""
    while True:
        a = txt.find(MARK_START)
        if a == -1:
            return txt
        b = txt.find(MARK_END, a)
        if b == -1:
            return txt
        txt = txt[:a] + txt[b + len(MARK_END):]


def main():
    apply_ = "--apply" in sys.argv
    undo   = "--undo" in sys.argv

    files = sorted(glob.glob("*.html"))
    if not files:
        print("Aucun fichier .html ici.")
        print("Place le script a la racine du depot ddms-site.")
        return

    touched = skipped = 0

    for f in files:
        with io.open(f, "r", encoding="utf-8", errors="strict", newline="") as fh:
            src = fh.read()

        if undo:
            out = strip_block(src)
            action = "retire"
        else:
            base = strip_block(src)          # evite les doublons
            pos = find_head(base)
            if pos == -1:
                print("  [!] %-32s pas de <head> -> ignore" % f)
                skipped += 1
                continue
            out = base[:pos] + BLOCK + base[pos:]
            action = "injecte"

        if out == src:
            print("  =   %-32s inchange" % f)
            skipped += 1
            continue

        print("  OK  %-32s %s" % (f, action))
        touched += 1

        if apply_ or undo:
            with io.open(f, "w", encoding="utf-8", newline="") as fh:
                fh.write(out)

    print("")
    print("%d fichier(s) concerne(s), %d inchange(s)." % (touched, skipped))
    if not (apply_ or undo):
        print("SIMULATION — rien n'a ete ecrit.")
        print("Relance avec  --apply  pour appliquer.")
    else:
        print("Ecriture terminee. Commit + push, Netlify redeploie.")


if __name__ == "__main__":
    main()
