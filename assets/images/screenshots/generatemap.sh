#!/bin/bash

[ -e map.csv ] && rm map.csv

sips -g pixelWidth -g pixelHeight */* | xargs -n5 sh -c 'echo `echo "$0" | sed -e "s/.*assets/assets/g"`,$2,$4' > map.csv
