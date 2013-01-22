var path = require('path');


function getCasperPath()
{
    var binPath = path.join(__dirname,"..",'casper');

    if (process.platform === 'win32') {
        binPath = path.join(__dirname,"..","bin",'casperjs.bat');
    } else {
        binPath = path.join(binPath, 'bin' ,'casperjs');
    }

    return binPath;
}

function getPhantomPath()
{
    var binPath = path.join(__dirname, "..",'phantom')

    if (process.platform === 'win32') {
        binPath = path.join(binPath, 'phantomjs.exe')
    } else {
        binPath = path.join(binPath, 'bin' ,'phantomjs')
    }

    return binPath;
}


exports.casperPath  = getCasperPath();
exports.phantomPath = getPhantomPath();
