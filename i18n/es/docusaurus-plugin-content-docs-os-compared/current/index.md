---
sidebar_position: 1
sidebar_label: Introducción
title: "Comparativa de SO: Linux, seL4 y GooseOS"
slug: /
---

# Comparativa de SO: Linux, seL4 y GooseOS

> Tres sistemas operativos. Tres filosofías. El mismo hardware. Cada decisión de diseño que un SO toma — desde "¿dónde vive el kernel en memoria?" hasta "¿cómo se comunican dos procesos?" — ha sido respondida de forma distinta por equipos distintos con objetivos distintos. Este libro pone esas respuestas una junto a la otra.

## ¿Qué es esto?

Este libro toma cada tema fundamental del diseño de sistemas operativos y examina cómo lo manejan tres sistemas reales:

- **Linux** — el gigante monolítico de 30 millones de líneas. Corre en todo, hace todo, tiene una solución (y tres alternativas deprecadas) para cada problema.
- **seL4** — el microkernel de 10.000 líneas verificado formalmente. Probado matemáticamente correcto. El minimalista extremo.
- **GooseOS** — el microkernel didáctico de 1.500 líneas escrito en Rust sobre RISC-V. Lo bastante pequeño para entenderse del todo, lo bastante real para correr en hardware.

El objetivo no es declarar un ganador. Es mostrar que el diseño de SO es un **espacio de compromisos**, no un conjunto de respuestas correctas. Linux optimiza para compatibilidad y rendimiento. seL4 optimiza para seguridad y corrección formal. GooseOS optimiza para claridad y aprendizaje. Cada uno hace la elección "correcta" para sus objetivos — y esas elecciones son a menudo completamente distintas.

## ¿Para quién es?

- **Estudiantes de CS** que aprendieron teoría de SO en un libro de texto pero quieren ver cómo los sistemas reales lo implementan
- **Desarrolladores embebidos** eligiendo entre Linux, un RTOS y algo a medida
- **Lectores de GooseOS** que quieren contexto sobre por qué diseñamos las cosas así
- **Ingenieros curiosos** que usan Linux a diario pero nunca miraron dentro del kernel
- **Cualquiera** que se haya preguntado "¿por qué Linux hace eso *así*?"

## Cómo leer este libro

Cada capítulo cubre un tema de SO — arranque, memoria, IPC, planificación, etc. Dentro de cada capítulo:

1. **El problema** — qué debe resolver todo SO
2. **La respuesta de Linux** — el enfoque monolítico, con referencias al código
3. **La respuesta de seL4** — el enfoque microkernel, con propiedades formales
4. **La respuesta de GooseOS** — el enfoque didáctico, con fuente completa
5. **Tabla comparativa** — resumen lado a lado de las decisiones
6. **Análisis de compromisos** — por qué cada elección tiene sentido en su contexto

Puedes leer de principio a fin o saltar a cualquier tema que te interese. Cada capítulo es autocontenido.

## El reparto

### Linux (1991–presente)

Creado por Linus Torvalds como "sólo un hobby, no será grande ni profesional como GNU." Ahora corre en todo, desde relojes hasta supercomputadoras. El kernel es **monolítico** — drivers de dispositivos, sistemas de archivos, redes y planificación todos corren en espacio de kernel con acceso total al hardware. Cuando algo falla en un driver, todo el kernel puede caer.

**Métrica clave**: ~30.000.000 líneas de código. ~400 syscalls. ~30 años de restricciones de compatibilidad hacia atrás.

### seL4 (2009–presente)

Creado en NICTA (ahora Data61/CSIRO) en Australia. Un **microkernel** con una propiedad extraordinaria: tiene una prueba matemática verificada por máquina de que el código C implementa la especificación abstracta correctamente. Sin desbordamientos de búfer. Sin desreferencias a punteros nulos. Sin comportamiento indefinido. La prueba cubre el kernel — unas 10.000 líneas de C.

**Métrica clave**: ~10.000 líneas de C. ~3 syscalls (Send, Receive, Yield + variantes). Verificado formalmente.

### GooseOS (2025–presente)

Creado como proyecto de aprendizaje y documentado en tiempo real. Un microkernel RISC-V escrito en Rust, apuntando a cargas de contenedores WASM-nativos. Actualmente tiene 10 syscalls y corre en la placa VisionFive 2.

**Métrica clave**: ~1.500 líneas de Rust. 18 syscalls planeadas. Corre en hardware real.

## Esquema de capítulos

### Parte 1: Fundamentos

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 1 | Arranque | ¿Cómo se ejecuta la primera instrucción? |
| 2 | Niveles de privilegio | ¿Cómo protege la CPU al kernel del código de usuario? |
| 3 | Manejo de trampas | ¿Qué pasa cuando algo va mal (o bien)? |
| 4 | La interfaz de syscalls | ¿Cómo le pide el userspace al kernel que haga cosas? |

### Parte 2: Memoria

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 5 | Memoria física | ¿Cómo sabe el SO qué RAM existe? |
| 6 | Memoria virtual | ¿Cómo funcionan las tablas de páginas? |
| 7 | Asignación de páginas | ¿Cómo se rastrean y distribuyen las páginas físicas? |
| 8 | Memoria de userspace | ¿Cómo obtienen los procesos más memoria en runtime? |
| 9 | Protección de memoria | ¿Cómo aplica la MMU el aislamiento? |

### Parte 3: Procesos

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 10 | ¿Qué es un proceso? | ¿Cómo se representa un programa en ejecución? |
| 11 | Cambio de contexto | ¿Cómo cambia la CPU entre procesos? |
| 12 | Planificación | ¿Quién corre después y por cuánto tiempo? |
| 13 | Creación de procesos | ¿Cómo nacen los procesos nuevos? |

### Parte 4: Comunicación

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 14 | Modelos de IPC | Pipes vs mensajes vs memoria compartida vs rendezvous |
| 15 | IPC síncrono | ¿Cómo funciona la mensajería zero-copy estilo seL4? |
| 16 | Patrones RPC | ¿En qué se diferencia call/reply de send/receive? |
| 17 | El atajo monolítico | Por qué Linux no necesita IPC para la mayoría de cosas |

### Parte 5: Dispositivos y E/S

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 18 | Manejo de interrupciones | ¿Cómo capta el hardware la atención de la CPU? |
| 19 | Drivers de dispositivos | Drivers en kernel space vs userspace |
| 20 | UART: un caso de estudio | Un periférico, tres enfoques |

### Parte 6: Seguridad y aislamiento

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 21 | Capacidades | ¿A qué puede acceder un proceso y quién decide? |
| 22 | La cuestión del sandbox | Aislamiento por hardware vs aislamiento a nivel de lenguaje |
| 23 | Superficie de ataque | ¿Cuántas líneas de código deben ser confiables? |

### Parte 7: Decisiones de arquitectura

| Capítulo | Tema | La pregunta |
|---------|-------|-------------|
| 24 | Monolítico vs microkernel | El debate más viejo del diseño de SO |
| 25 | Cantidad de syscalls | 3 vs 18 vs 400 — ¿cuál es el número correcto? |
| 26 | Elección de lenguaje | C vs Rust vs métodos formales |
| 27 | El futuro | WASM, unikernels y lo que viene después |

## Referencias al código

A lo largo de este libro referenciamos archivos y funciones específicos:

- **Linux**: fuente del kernel en [kernel.org](https://www.kernel.org/), referenciado por ruta (ej., `kernel/sched/core.c`)
- **seL4**: fuente en [github.com/seL4](https://github.com/seL4/seL4), referenciado por ruta
- **GooseOS**: fuente en [github.com/westerngazoo/goose-os](https://github.com/westerngazoo/goose-os), referenciado por archivo

Todos los ejemplos de código muestran la implementación real — no pseudocódigo, no versiones simplificadas. Si el código real es demasiado complejo para mostrar inline, mostramos la ruta crítica y enlazamos a la fuente completa.

## Un avance: la interfaz de syscalls

Para darte una probada de cómo se ve cada capítulo, aquí tienes un vistazo a la comparativa de syscalls:

```
                Linux              seL4              GooseOS
                ─────              ────              ───────
Nº de syscalls  ~450               ~3 (+ variantes)  18 (planeadas)
Convención      a7=número          Usa IPC           a7=número
Despacho        Lookup en tabla    Switch            Match en Rust
Entrada         ecall → trap       ecall → trap      ecall → trap
Salida          sret               sret              sret
```

El mismo mecanismo de hardware (ecall/sret), filosofías salvajemente distintas sobre qué debe hacer el kernel cuando llega allí.

Empecemos.
