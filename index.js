module.exports = ({ routes }) => ({
  name: 'kit-sw-workbox',
  enforce: 'post',

  //  we want to transform the $service-worker which is imported by our service-worker file
  // this so we can customize it to include hashes so it can work well with workbox-precaching
  // which will make our service-worker auto updatable
  transform(code, id) {
    if (id.endsWith('.svelte/build/runtime/service-worker.js')) {
      // to generate randon string hash
      const hash = () => Math.floor(2147483648 * Math.random()).toString(36);

      // if all routes are cached too, this site should work 100% offline after first load

      code = code.replace(
        /files[\ ]*\=[\ ]*\[/,
        `files = [${routes.reduce((rts, rt) => {
          return rts + `\n\t"${rt}",`;
        }, '')}`
      );
      // console.log(code, routes);

      // construct regular expressons
      const reBuild = /export[\ ]*const[\ ]*build[\ ]*\=[\ ]*(?<code>\[[^\[\]]*\])/;
      const reFiles = /export[\ ]*const[\ ]*files[\ ]*\=[\ ]*(?<code>\[[^\[\]]*\])/;

      // extract build files
      // const build = JSON.parse(code.match(reBuild)?.groups?.code || []);
      const build = JSON.parse(code.match(reBuild).groups.code);
      // extract static files/assets
      //const files = JSON.parse(code.match(reFiles)?.groups?.code || []);
      const files = JSON.parse(code.match(reFiles).groups.code);

      code = code.replace(
        reBuild,
        'export const build = ' +
          JSON.stringify(build.reduce((obj, file) => [...obj, { url: file, revision: hash() }], []))
      );

      code = code.replace(
        reFiles,
        'export const files = ' +
          JSON.stringify(files.reduce((obj, file) => [...obj, { url: file, revision: hash() }], []))
      );
      return { code };
    }
  },
});
