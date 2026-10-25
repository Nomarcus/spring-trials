#!/bin/sh
# Kör alla fysiktester mot src/core.js. Jämför siffrorna mot docs/fjadra-PHYSICS.md (förväntade värden) innan/efter fysikändringar.
cd "$(dirname "$0")"
for t in feel drops ragdoll_energy ragdoll_slide gas_ramp gas_lean save hop hang; do echo "=== $t"; node $t.js || echo "FEL i $t"; done
