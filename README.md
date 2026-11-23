# dcid-m3-auth

Microservicio de autenticación basado en Node.js, Express y PostgreSQL.

## GitHub Actions: conceptos básicos

GitHub Actions ejecuta tareas automáticamente a partir de eventos en GitHub,
como un `push` o la apertura de un pull request (PR). También permite iniciar
algunos flujos manualmente. Un **workflow** es el archivo YAML que define esas
tareas; una ejecución concreta del workflow se llama **run**.

Un **pipeline** es una secuencia de tareas automatizadas. En GitHub Actions
se implementa mediante uno o más workflows. Cada workflow contiene **jobs**,
y cada job tiene **steps** (pasos). Un **runner** es la máquina que ejecuta
un job: aquí GitHub proporciona una VM Linux nueva para cada job y la descarta
al terminar. Una **action** es un componente reutilizable dentro de un paso.
Azure DevOps tiene conceptos parecidos, aunque usa otra plataforma y sintaxis.

Un **artefacto** es un archivo generado durante una ejecución y guardado en
GitHub para descargarlo o compartirlo entre jobs. Por ejemplo, puede ser un
reporte de pruebas o un paquete listo para desplegar. No es lo mismo que una
caché, que se usa para acelerar ejecuciones posteriores.

## Pipeline preparado

El workflow está en [`.github/workflows/ci.yml`](.github/workflows/ci.yml).
Se activa con cada `push`, cada evento de pull request configurado por defecto
y manualmente mediante `workflow_dispatch`. Consta de un job que:

1. Descarga el código del commit correspondiente.
2. Prepara Node.js 22 y habilita la caché de npm.
3. Ejecuta `npm ci`: instala las dependencias exactamente según
   `package-lock.json`. Si el archivo no coincide con `package.json`, falla.
4. Comprueba la sintaxis de los archivos JavaScript de `src` y `tests`.
5. Ejecuta `node --test`, el mismo comando que usa `npm test`, y crea un
   reporte JUnit XML.
6. Sube el reporte como artefacto `reporte-pruebas`, incluso si las pruebas
   fallan, siempre que el reporte se haya generado. Se solicita conservarlo
   durante 7 días, sujeto a las políticas del repositorio.

Si un paso falla, el job queda marcado como fallido; el reporte se intenta
subir después de las pruebas, pero no si se canceló la ejecución o no se llegó
a ejecutarlas. Los registros de cada paso quedan disponibles en la ejecución.
El artefacto contiene el reporte, **no** el microservicio empaquetado.

Este proyecto no define un script de compilación: la comprobación de sintaxis
no es una compilación. El pipeline tampoco levanta PostgreSQL ni el servicio,
no prueba sus endpoints, no publica imágenes y no despliega nada. Actualmente
solo hay una prueba que verifica que el modelo exporta algo; un resultado
verde no garantiza que el registro, el login o la integración con la base de
datos funcionen. Habría que agregar pruebas y etapas específicas para eso.

No se necesitan secrets ni un archivo `.env` para este pipeline: las pruebas
actuales no usan la base de datos. Para futuras etapas que sí necesiten
credenciales, usar GitHub Secrets y nunca subir credenciales reales al código,
los logs o los artefactos.

## Cómo ejecutarlo en GitHub

La carpeta `auth` es la raíz del repositorio Git. Los cambios locales no se
ejecutan en GitHub hasta que hagas commit y push. Por ejemplo, desde PowerShell,
ubicado en `auth`, podés crear una rama:

```powershell
git switch -c ci-github-actions
git add .github\workflows\ci.yml README.md
git commit -m "Configurar integración continua"
git push -u origin ci-github-actions
```
(Texto de prueba)
El `push` inicia una ejecución. En GitHub, abrí el repositorio y entrá a la
pestaña **Actions**; seleccioná **CI**, la ejecución y el job **Comprobar y
probar** para ver los pasos y sus logs. Al final de la página de la ejecución
aparece **Artifacts**, donde podés descargar `reporte-pruebas` si se generó.
También podés abrir un PR hacia la rama principal: GitHub ejecutará el workflow
para el PR y mostrará el resultado en sus checks.

Para ejecutarlo manualmente, primero incorporá el workflow a la rama
predeterminada del repositorio. Después entrá en **Actions > CI > Run workflow**,
elegí la rama y confirmá. GitHub Actions debe estar habilitado en el repositorio;
la disponibilidad y los límites de uso dependen de la cuenta y sus políticas.

## Probar localmente

Con Node.js 22 instalado, desde `auth`:

```powershell
npm ci
npm test
```

`npm ci` reemplaza la carpeta `node_modules` local. Para iniciar el servicio
aparte se requiere configurar el entorno y, para las operaciones que la usan,
PostgreSQL. Consultá las variables esperadas en [`.env.example`](.env.example);
sus valores son ejemplos y deben reemplazarse en un entorno real.

## Más información

- [Introducción a GitHub Actions](https://docs.github.com/es/actions/about-github-actions/understanding-github-actions)
- [Almacenar y compartir artefactos](https://docs.github.com/es/actions/tutorials/store-and-share-data)
