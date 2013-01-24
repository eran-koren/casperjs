var fs = require('fs');
var request = require('request');
var path = require("path");
var unzip = require('unzip');
var spawn = require('child_process').spawn;

function getPhantomURL ()
{
    var platform_suffix;

    if (process.platform === 'linux' && process.arch === 'x64')
    {
        platform_suffix = 'linux-x86_64.tar.bz2';
    }
    else if (process.platform === 'linux')
    {
        platform_suffix = 'linux-i686.tar.bz2';
    }
    else if (process.platform === 'darwin')
    {
        platform_suffix = 'macosx.zip';
    }
    else if (process.platform === 'win32')
    {
        platform_suffix = 'windows.zip';
    }
    else
    {
        console.log('unknown platform:', process.platform, process.arch);
        //TODO: better error handeling
    }

    return  'http://phantomjs.googlecode.com/files/phantomjs-1.8.0-' + platform_suffix;
}



function dlAndExtract(extractTo,remoteURL,then)
{
    //todo: better error handling

    function cleanUp() {
        console.log("clean up " + extractTo);
        var innerDir = fs.readdirSync(extractTo + "tmp")[0];
        fs.renameSync(path.join(__dirname, extractTo + "tmp", innerDir), path.join(__dirname, extractTo));

        //cleanup
        fs.rmdirSync(path.join(__dirname, extractTo + "tmp"));
        fs.unlinkSync(zipName);

        //any additional steps e.g. fixing file permissions
        if (then)
        {
            then();
        }
    }

    var zipName = extractTo + ".zip";
    var file    = fs.createWriteStream(zipName);
    var dl      = request(remoteURL);
    console.log("downloading " + extractTo);
    dl.pipe(file);
    file.on("close", function ()
    {
        console.log("extracting " + extractTo);
        fs.mkdirSync(path.join(__dirname, extractTo + "tmp"));

        if (process.platform === 'linux')
        {
            console.log("zip name " + zipName + " extract "+ extractTo);

            require('child_process').exec('tar xjf ' + zipName + ' -C ' + extractTo + 'tmp',
              function (error, stdout, stderr) {
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                  console.log('exec error: ' + error);
                }
                else
                {
                    cleanUp();
                }
            });
        /*    var tar    = spawn('tar', ['-xjf',zipName, '-C',extractTo + "tmp"]);

            //print output for easier debugging
            tar.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
            });
            tar.stderr.on('data', function (data) {
                console.log('stderr: ' + data);
            });

            tar.on('exit', cleanUp);*/
        }
        else
        {
            var zip = unzip.Extract({ path:path.join(__dirname, extractTo + "tmp") });
            fs.createReadStream(zipName).pipe(zip);

            zip.on("close", cleanUp);
        }

    });
}

dlAndExtract("casper",'https://github.com/n1k0/casperjs/zipball/1.0.1',function then()
{
    //make file executable (on *nix)
    if (process.platform != 'win32')
    {
           fs.chmodSync(path.join(__dirname, "casper", "bin", "casperjs"), 0777);
    }
});

dlAndExtract("phantom",getPhantomURL(),function then()
{
    //make file executable (on *nix)
    if (process.platform != 'win32')
    {
        fs.chmodSync(path.join(__dirname, "phantom", "bin", "phantomjs"), 0777);
    }
});



