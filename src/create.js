var has = require("has"),
    vfs = require("vinyl-fs"),
    once = require("once"),
    isString = require("is_string"),
    isFunction = require("is_function"),
    watch = require("./watch"),
    series = require("./series"),
    parallel = require("./parallel");


module.exports = create;


function create() {
    var _tasks = {};

    function task(name, description, fn) {
        if (isFunction(description)) {
            fn = description;
            description = "";
        }
        if (isFunction(name)) {
            fn = name;
            name = fn.displayName || fn.name;
        }

        if (!fn) {
            return _tasks[name];
        } else {
            if (!name) {
                throw new TypeError("task name must be specified");
            }
            if (!isString(name)) {
                throw new TypeError("task name must be a string");
            }
            if (!isFunction(fn)) {
                throw new TypeError("task function must be specified");
            }

            if (description) {
                fn.description = description;
            }
            _tasks[name] = fn;

            return fn;
        }
    }

    function run(name, callback) {
        var cb = once(callback),
            task = _tasks[name];

        if (isFunction(task)) {
            return task(cb);
        } else {
            throw new Error("No task named " + name);
        }
    }

    function help(name) {
        var tasks = _tasks,
            localHas = has,
            ret;

        if (name && localHas(tasks, name)) {
            return taskToString(tasks[name], name);
        } else {
            ret = "";

            for (name in tasks) {
                if (localHas(tasks, name)) {
                    ret += taskToString(tasks[name], name);
                }
            }

            return ret;
        }
    }

    task.src = vfs.src;
    task.dest = vfs.dest;
    task.symlink = vfs.symlink;
    task.watch = watch;

    task.run = run;
    task.help = help;
    task.series = series;
    task.parallel = parallel;
    task.create = create;

    return task;
}

function taskToString(fn, displayName) {
    if (!fn.description) {
        return " - " + displayName + "\n\r";
    } else {
        return " - " + displayName + ":\n\r\t\t" + fn.description + "\n\r";
    }
}
