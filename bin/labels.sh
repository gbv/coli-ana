#!/bin/bash

# Extrahiere Dateinamen und alle Klassenbenennungen aller Bestandteile
jq -r -f /dev/stdin public/dump.ndjson <<'JQ' |

# Vollständig analysierte Nummern
select(.memberList[-1].notation[1]|endswith("-")|not)

| [

  .notation[0],

  # Bestandteile der Zerlegung
  ( .memberList | map(

      # Ignoriere Hilfstafel-Wurzel und Facettenindikator
      select(.notation[0]|test("^(T..?--)?0$")|not) 

      # Label
      | .prefLabel.de

    ) | join(" / ")
  )

] | @tsv
JQ

# Schreibe Labels in Datei, basierend auf DDC-Nummer
{
  while IFS=$'\t' read -r number labels
  do
    main=${number:0:3}
    dir="labels/${number:0:3}"
    mkdir -p "$dir"    
    echo "$labels" > "$dir/$number.txt"
    [[ ${#number} == 3 ]] && echo $number
  done 
}

