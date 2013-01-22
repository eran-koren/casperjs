//var https = require('https');
var fs = require('fs');
//var AdmZip = require('adm-zip');
var request = require('request');
var path = require("path");
var unzip = require('unzip');

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
    var zipName = extractTo + ".zip";
    var file    = fs.createWriteStream(zipName);
    var dl      = request(remoteURL);
    console.log("downloading " + extractTo);
    dl.pipe(file);
    file.on("close", function ()
    {
        console.log("extracting " + extractTo);
        fs.mkdirSync(path.join(__dirname, extractTo + "tmp"));
        var zip = unzip.Extract({ path:path.join(__dirname, extractTo + "tmp") });
        fs.createReadStream(zipName).pipe(zip);

        zip.on("close", function () {
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
        });
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


