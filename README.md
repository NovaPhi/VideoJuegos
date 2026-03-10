# Breakout

Juego Breakout desarrollado en HTML5 Canvas y JavaScript.
**Autor:** Luis Arias — 10 de marzo de 2026

---

## Cómo correr el juego

1. Coloca los siguientes archivos en la misma carpeta:
   - `Breakout.html`
   - `Breakout.js`
   - `Breakout.css`
   - `FIREBALL.png` 
   - `paddle.png` 
   - `Block.png` 

2. Abre `Breakout.html` en un navegador web (Chrome o Firefox recomendados).

3. Presiona **Espacio** para comenzar.




## Controles

| Tecla | Acción |
|-------|--------|
| `A` | Mover la paleta hacia la izquierda |
| `D` | Mover la paleta hacia la derecha |
| `Espacio` | Iniciar el juego / Reiniciar después de ganar o perder |



## Reglas

- La pelota rebota en los bordes izquierdo, derecho y superior de la pantalla.
- Si la pelota cae por el borde inferior, pierdes una vida.
- Tienes **3 vidas** en total. Al perderlas todas aparece la pantalla de **GAME OVER**.
- Cada bloque que la pelota toca queda destruido.
- El número de bloques destruidos se muestra en pantalla y se actualiza en tiempo real.



## Objetivo

Destruir todos los bloques de la pantalla sin perder las 3 vidas.
Al eliminar el último bloque, aparece la pantalla de **YOU WIN!**



## Configuración

Para cambiar el número de filas y columnas de bloques, edita estas constantes al inicio de `Breakout.js`:

```js
const BLOCK_COLS = 11;  // número de columnas
const BLOCK_ROWS = 4;   // número de filas
```
