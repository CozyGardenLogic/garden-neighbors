GARDEN NEIGHBORS - A Cozy Plant Puzzle
Graficos definitivos (paquete de ilustraciones)
=================================================

Todos los PNG tienen fondo transparente. Ninguna imagen lleva texto escrito
(salvo logo.png): los rotulos los pone el codigo con la fuente Patrick Hand.

assets/
  logo.png                   Logotipo "Garden Neighbors - A Cozy Plant Puzzle" (1521x1004)
  bg_start_landscape.jpg     Fondo pantalla de inicio, horizontal (1672x941)
  bg_start_portrait.jpg      Fondo pantalla de inicio, vertical (941x1672)
  bg_game_landscape.jpg      Fondo pantalla de juego, horizontal (cesped con el centro despejado)
  bg_game_portrait.jpg       Fondo pantalla de juego, vertical (cesped con el centro despejado)
  bed_frame.png              Marco del bancal (sirve para 3x3 y 4x4; ver ui_slices.json)
  seed_drawer.png            Cajon de semillas (se estira a lo ancho)
  soil_sun_1.png, soil_sun_2.png       Casilla de sol (2 variantes), 512x512, vista desde arriba
  soil_shade_1.png, soil_shade_2.png   Casilla de sombra (2 variantes), 512x512
  soil_rocks.png                       Casilla de rocas, 512x512

assets/plants/   (512x512, base de la planta en el punto 50% ancho / 80% alto)
  seed.png                   Semilla comun para todas las plantas
  {planta}_sprout.png / _young.png / _adult.png / _wilted.png
  plantas: tomato, lettuce, basil, mint, peas, onion, beans, pumpkin
  Nota: beans = judias de VAINA MORADA (variedad real).

assets/ui/
  ui_sign.png                Cartel de madera con clavos (Level X, titulos)
  ui_button_round.png        Boton redondo (atras, sonido, ajustes)
  ui_button.png              Boton de madera (Undo, Reset)
  ui_button_gold.png         Boton dorado (Hint)
  ui_button_green.png        Boton verde (Play, My Garden, Next garden, Got it!)
  ui_panel.png               Panel de pergamino (Rules y ventanas)
  ui_card.png                Tarjeta del cajon de semillas
  ui_bubble.png              Bocadillo de pista / error
  icon_*.png                 Iconos 256x256. Sobre madera usar la version *_light (crema);
                             sobre papel crema, la version normal (marron).
  ui_slices.json             Margenes para estirar cada pieza sin deformarla (9-slice),
                             reglas del marco del bancal y de la separacion de casillas,
                             y para que sirve cada icono.
