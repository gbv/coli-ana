#!/bin/bash

DUMP=public/dump.ndjson

# Zur Aktualisierung bitte Dump löschen!
[[ -f $DUMP ]] || \
  psql coli-ana --no-align -q -c '\t' -c 'SELECT "memberList" FROM data' | jq -c '{memberList:.}' > $DUMP

# Anzahl analysierter DDC-Notationen
TOTAL=$(wc -l < $DUMP)

# Davon unvollständig analysiert
INCOMPLETE=$(jq -r '.memberList[-1].notation[1]|select(endswith("-"))' $DUMP | wc -l)

# Anzahl unterschiedlicher DDC-Klassen die irgendwo in der Analyse vorkommen
ELEMENTS=$(jq -r '.memberList[].notation[0]' $DUMP | sort | uniq | wc -l)

# Histogram der Anzahl von Elementen pro Analyse
ELEMENTS_COUNT=$(
  jq -r '.memberList|length' $DUMP | sort | uniq -c | sort -nk2 | sed 's/^ *//' \
  | jq -R 'split(" ")|{key:.[1],value:(.[0]|tonumber)}' | jq -s 'from_entries'
)

cat > public/stats.json <<-JSON
{
  "numbers": $TOTAL,
  "incomplete": $INCOMPLETE,
  "elements": $ELEMENTS,
  "elementsCount": $ELEMENTS_COUNT
}
JSON

