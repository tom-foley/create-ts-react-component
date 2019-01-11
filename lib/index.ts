import * as fs from 'fs';
import * as path from 'path';
import {
    ChildProcess,
    exec,
    ExecException,
    ExecOptions
} from 'child_process';

function logError(msg: string): void {
    console.error(`ERROR: ${msg}`);
}

function isDefined(obj: any): boolean {
    return typeof (obj) !== typeof (undefined) && obj !== null;
}

export default function generate(componentName: string): void {
    if (!isDefined(componentName) || componentName.length === 0) {
        return logError('component name not supplied');
    }

    try {
        const componentFolderPath: string = path.resolve(process.cwd(), componentName);
        const exists: boolean = fs.existsSync(componentFolderPath);

        if (exists) {
            return logError('a file or folder  with the specified component name already exists');
        }

        const mkDirOpts: fs.MakeDirectoryOptions = {
            recursive: true
        };

        fs.mkdirSync(componentFolderPath, mkDirOpts);

        const thisResourcesPath: string = path.resolve(__dirname, '../', 'resources');

        const newComponentTsxPath: string = path.join(componentFolderPath, componentName + '.tsx');
        const thisComponentTxtPath: string = path.join(thisResourcesPath, 'Component.txt');
        const thisComponentTxt: string = fs.readFileSync(thisComponentTxtPath).toString();
        const thisComponentTxtFixed: string = thisComponentTxt.replace(/__COMPONENTNAME__/gm, componentName);
        fs.writeFileSync(newComponentTsxPath, thisComponentTxtFixed);

        const newIndexTsPath: string = path.join(componentFolderPath, 'index.ts');
        const thisIndexTxtPath: string = path.join(thisResourcesPath, 'index.txt');
        const thisIndexTxt: string = fs.readFileSync(thisIndexTxtPath).toString();
        const thisIndexTxtFixed: string = thisIndexTxt.replace(/__COMPONENTNAME__/gm, componentName);
        fs.writeFileSync(newIndexTsPath, thisIndexTxtFixed);

        const execOpts: ExecOptions = {
            cwd: componentFolderPath
        };

        const execCb = (err: ExecException | null, stdout: string, stderr: string): void => {
            if (err) {
                return logError(err.message);
            }

            console.log(stdout);
        };

        const child: ChildProcess = exec('npm install', execOpts, execCb);
    }
    catch (e) {
        return logError((e as NodeJS.ErrnoException).message);
    }
}