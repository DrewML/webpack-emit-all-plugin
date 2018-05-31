const path = require('path');

module.exports = class EmitAllPlugin {
    constructor(opts = {}) {
        this.ignorePattern = opts.ignorePattern || /node_modules/;
        this.path = opts.path;
        this.filenameTransform =
            opts.filenameTransform || (filename => filename);
    }

    shouldIgnore(path) {
        return !path || this.ignorePattern.test(path);
    }

    apply(compiler) {
        compiler.hooks.afterCompile.tapAsync(
            'EmitAllPlugin',
            (compilation, cb) => {
                const { modules } = compilation;
                modules.forEach(mod => {
                    const absolutePath = mod.resource;
                    if (this.shouldIgnore(absolutePath)) return;

                    // Used for vendor chunk
                    if (mod.constructor.name === 'MultiModule') return;

                    const source = mod._source._value;
                    const projectRoot = compiler.context;
                    const out = this.path || compiler.options.output.path;

                    const relativePath = this.filenameTransform(
                        absolutePath.replace(projectRoot, '')
                    );
                    const dest = path.join(out, relativePath);

                    compiler.outputFileSystem.mkdirp(
                        path.dirname(dest),
                        err => {
                            if (err) throw err;

                            compiler.outputFileSystem.writeFile(
                                dest,
                                source,
                                err => {
                                    if (err) throw err;
                                }
                            );
                        }
                    );
                });
                cb();
            }
        );
    }
};
