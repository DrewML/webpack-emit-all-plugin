const path = require('path');
const MemoryFileSystem = require('memory-fs')
const mkdirp = require('mkdirp');
const fs = require('fs');

module.exports = class EmitAllPlugin {
    constructor(opts = {}) {
        this.ignorePattern = opts.ignorePattern || /node_modules/;
        this.ignoreExternals = !!opts.ignoreExternals;
        this.path = opts.path;
        this.filenameTransform = opts.filenameTransform || (filename => filename);
        this.filecontentTransform = opts.filecontentTransform || (contents => contents);
        this.emitInDev = opts.emitInDev;
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

                    if (this.ignoreExternals && mod.external) return;
                    if (this.shouldIgnore(absolutePath)) return;

                    // Used for vendor chunk
                    if (mod.constructor.name === 'MultiModule') return;

                    const projectRoot = compiler.context;
                    const out = this.path || compiler.options.output.path;

                    const relativePath = this.filenameTransform(
                        absolutePath.replace(projectRoot, '')
                    );
                    const dest = path.join(out, relativePath);

                    const source =
                        this.filecontentTransform(mod._source._value, relativePath, absolutePath);

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
                    if (this.emitInDev && compiler.outputFileSystem instanceof MemoryFileSystem) {
                        mkdirp(
                            path.dirname(dest),
                            err => {
                                if (err) throw err;

                                fs.writeFileSync(
                                    dest,
                                    source,
                                    err => {
                                        if (err) throw err;
                                    }
                                );
                            }
                        );
                    }
                });
                cb();
            }
        );
    }
};
