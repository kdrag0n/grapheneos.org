// @license magnet:?xt=urn:btih:d3d9a9a6595521f9666a5e94cc830dab83b65699&dn=expat.txt MIT

async function unlockBootloader() {
    const webusb = await Adb.open("WebUSB");

    if (!webusb.isFastboot()) {
        console.log("error: not in fastboot mode");
    }

    console.log("connecting with fastboot");

    const fastboot = await webusb.connectFastboot();
    await fastboot.send("flashing unlock");
    await fastboot.receive();
}

async function downloadRelease() {
    const webusb = await Adb.open("WebUSB");

    if (!webusb.isFastboot()) {
        console.log("error: not in fastboot mode");
    }

    console.log("connecting with fastboot");

    const fastboot = await webusb.connectFastboot();
    await fastboot.send("getvar:product");
    const response = await fastboot.receive();
    if (fastboot.get_cmd(response) == "FAIL") {
        throw new Error("getvar product failed");
    }
    const decoder = new TextDecoder();
    const product = decoder.decode(fastboot.get_payload(response));

    const baseUrl = "https://releases.grapheneos.org/";
    const metadata = await (await fetch(baseUrl + product + "-stable")).text();
    const buildNumber = metadata.split(" ")[0];
    const downloadUrl = baseUrl + product + "-factory-" + buildNumber + ".zip";
    console.log(downloadUrl);

    // Download factory images
    //
    // Need to do this in a way that works well with huge files, particularly since the zip needs
    // to be extracted. Could potentially split it up on the server if this works out badly.
}

async function lockBootloader() {
    const webusb = await Adb.open("WebUSB");

    if (!webusb.isFastboot()) {
        console.log("error: not in fastboot mode");
    }

    console.log("connecting with fastboot");

    const fastboot = await webusb.connectFastboot();
    await fastboot.send("flashing lock");
    await fastboot.receive();
}

if ("usb" in navigator) {
    console.log("WebUSB available");

    const unlockBootloaderButton = document.getElementById("unlock-bootloader");
    unlockBootloaderButton.disabled = false;
    unlockBootloaderButton.onclick = unlockBootloader;

    const downloadReleaseButton = document.getElementById("download-release");
    downloadReleaseButton.disabled = false;
    downloadReleaseButton.onclick = downloadRelease;

    const lockBootloaderButton = document.getElementById("lock-bootloader");
    lockBootloaderButton.disabled = false;
    lockBootloaderButton.onclick = lockBootloader;
} else {
    console.log("WebUSB unavailable");
}

// @license-end
