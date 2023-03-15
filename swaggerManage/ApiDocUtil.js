class ApiDocUtil {
    static diveObj(obj, ...args) {
        let runEach;
        let runDest;
        const runDive = function (runEachRes, current, args, i) {
            const isLast = i >= (args.length - 1);
            const key = args[i];
            return isLast ? runDest(current, key) : runDive(runEach(current, key), current[key], args, i + 1);
        }

        const entityObj = {
            onEach: (func) => { // set onEach
                runEach = func;
                return entityObj;
            },
            onDest: (func) => {
                runDest = func;
                return entityObj;
            },
            dive: () => {
                runDive(null, obj, args, 0);
            }
        };

        return entityObj;
    }
}

module.exports = ApiDocUtil