import gsap from "gsap";
import Notify from "simple-notify";
import imagesLoaded from "imagesloaded";
const { ethers } = require("ethers");
import Scrollbar, { ScrollbarPlugin } from "smooth-scrollbar";
import getLoveToken from "./loveToken";

class DisableScrollPlugin extends ScrollbarPlugin {
  static pluginName = "disableScroll";

  static defaultOptions = {
    direction: "",
  };

  transformDelta(delta) {
    if (this.options.direction) {
      delta[this.options.direction] = 0;
    }

    return { ...delta };
  }
}

// load the plugin
Scrollbar.use(DisableScrollPlugin);

class AnchorPlugin extends ScrollbarPlugin {
  static pluginName = "anchor";

  onHashChange = () => {
    this.jumpToHash(window.location.hash);
  };

  onClick = (event) => {
    const { target } = event;

    if (target.tagName !== "A") {
      return;
    }

    const hash = target.getAttribute("href");

    if (!hash || hash.charAt(0) !== "#") {
      return;
    }

    this.jumpToHash(hash);
  };

  jumpToHash = (hash) => {
    const { scrollbar } = this;

    if (!hash) {
      return;
    }

    // reset scrollTop
    scrollbar.containerEl.scrollTop = 0;

    scrollbar.scrollIntoView(document.querySelector(hash));
  };

  onInit() {
    this.jumpToHash(window.location.hash);

    window.addEventListener("hashchange", this.onHashChange);

    this.scrollbar.contentEl.addEventListener("click", this.onClick);
  }

  onDestory() {
    window.removeEventListener("hashchange", this.onHashChange);

    this.scrollbar.contentEl.removeEventListener("click", this.onClick);
  }
}

// usage
Scrollbar.use(AnchorPlugin);

// Loading website
const bar = document.querySelector(".loading__bar--inner");
const counter_num = document.querySelector(".loading__counter--number");
let c = 0;

let barInterval = setInterval(() => {
  if (c === 100) {
    clearInterval(barInterval);
    gsap.to(".loading__text--border", {
      duration: 5,
      rotate: "90deg",
      left: "1000%",
    });
    gsap.to(".loading__text,.loading__counter,.loading__bar", {
      duration: 0.5,
      opacity: 0,
    });
    gsap.to(".loading__box", {
      duration: 1,
      height: "300px",
      width: "300px",
      borderRadius: "100%",
    });
    gsap.to(".loading__svg", {
      duration: 20,
      opacity: 1,
      rotate: "360deg",
    });
    gsap.to(".loading__box", {
      delay: 1,
      border: "none",
    });
    imagesLoaded(document.querySelectorAll("img"), () => {
      gsap.to(".loading", {
        delay: 1,
        duration: 2,
        zIndex: 1,
        background: "transparent",
        opacity: 0.5,
      });
      gsap.to(".loading__svg", {
        delay: 2,
        duration: 100,
        rotate: "360deg",
        // visibility: "hidden",
      });
      gsap.to("header", {
        duration: 1,
        delay: 1.3,
        top: "0",
      });
      gsap.to(".socials", {
        duration: 1,
        delay: 1.3,
        bottom: "10rem",
      });
      gsap.to(".scrollDown", {
        duration: 1,
        delay: 1.7,
        bottom: "3rem",
      });
      setTimeout(() => {
        let pageSmoothScroll = Scrollbar.init(document.body, {
          damping: 0.1,
          plugins: {
            disableScroll: {
              direction: "x",
            },
          },
        });
        pageSmoothScroll.track.xAxis.element.remove();
      }, 2000);
    });
  }
  bar.style.width = c + "%";
  counter_num.innerText = c++ + "%";
}, 20);

// Connecting to MetaMask
const connectButton = document.querySelector(".enableEthereumButton");
let currentAccount, loveToken;

connectButton.addEventListener("click", () => {
  if (typeof window.ethereum !== "undefined") {
    // initialize the contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    loveToken = getLoveToken(ethers, signer);

    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((accounts) => {
        // Show the user's address on the button
        const account = accounts[0];
        currentAccount = account;

        connectButton.innerHTML = `<span>
            0x${account[2]}${account[3]}${account[4]}....${account.slice(-4)}
          </span>`;

        // Setting the accounts changed listener
        window.ethereum.on("accountsChanged", function (accounts) {
          // Time to reload your interface with accounts[0]!
          const account = accounts[0];
          currentAccount = account;
          connectButton.innerHTML = `<span>
            0x${account[2]}${account[3]}${account[4]}....${account.slice(-4)}
          </span>`;
        });
      })
      .catch((error) => {
        // Handle error
        new Notify({
          status: "error",
          title: "Couldn't connect",
          text: error.message,
          effect: "slide",
          speed: 300,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 5000,
          gap: 20,
          distance: 20,
          type: 1,
          position: "right top",
        });

        // 4001 - The request was rejected by the user
        // -32602 - The parameters were invalid
        // -32603- Internal error
      });
  } else {
    new Notify({
      status: "error",
      title: "MetaMask not found",
      text: "Please install MetaMask first",
      effect: "slide",
      speed: 300,
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: 5000,
      gap: 20,
      distance: 20,
      type: 1,
      position: "right top",
    });
  }
});

// Adding LOVE to the user's wallet
const love = document.querySelector(".love");
love.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    const tokenAddress = "0x0203b585f090C7Fd0694003f098cbe0A1F5dbFab";
    const tokenSymbol = "LOVE";
    const tokenDecimals = 18;
    const tokenImage =
      "https://raw.githubusercontent.com/bytecode-velocity/LoveToken-Faucet/main/public/favicon.ico";

    try {
      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      const wasAdded = await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: tokenAddress, // The address that the token is at.
            symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: tokenDecimals, // The number of decimals in the token
            image: tokenImage, // A string url of the token logo
          },
        },
      });

      if (wasAdded) {
        new Notify({
          status: "success",
          title: "Thanks for adding LOVE!",
          text: "LOVE is now added to your wallet. Go to the faucet now!",
          effect: "slide",
          speed: 300,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 5000,
          gap: 20,
          distance: 20,
          type: 1,
          position: "right top",
        });
      } else {
        new Notify({
          status: "error",
          title: "LOVE was not added",
          text: "Please try again",
          effect: "slide",
          speed: 300,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 5000,
          gap: 20,
          distance: 20,
          type: 1,
          position: "right top",
        });
      }
    } catch (error) {
      new Notify({
        status: "error",
        title: "Couldn't add LOVE",
        text: error.message,
        effect: "slide",
        speed: 300,
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 5000,
        gap: 20,
        distance: 20,
        type: 1,
        position: "right top",
      });
    }
  } else {
    new Notify({
      status: "error",
      title: "MetaMask not found",
      text: "Please install MetaMask first",
      effect: "slide",
      speed: 300,
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: 5000,
      gap: 20,
      distance: 20,
      type: 1,
      position: "right top",
    });
  }
});

// Sending email
const name = document.querySelector("#nameInput");
const subject = document.querySelector("#subjectInput");
const email = document.querySelector("#emailInput");
const message = document.querySelector("#messageInput");

const sendMailButton = document.querySelector(".form__flex .coolButton");

sendMailButton.addEventListener("click", async () => {
  if (name.value !== "" && email.value != "" && message.value !== "") {
    // Checking loveToken contract
    if (loveToken) {
      // Checking the users balance
      let balance = await loveToken.balanceOf(currentAccount);
      balance = ethers.utils.formatUnits(balance);
      let txLoading, tx;

      if (balance >= 20) {
        // Send 5 LOVE from the user to the faucet
        try {
          txLoading = new Notify({
            status: "warning",
            title: "Sending tx.. please wait",
            text: "Please approve the transaction and wait for it's completion",
            effect: "slide",
            position: "left top",
            type: 1,
          });
          tx = await loveToken.transfer(
            "0x8263754F5854F0bccb8606af594C667325366abd",
            5
          );
          await tx.wait();
          txLoading.close();
        } catch (error) {
          txLoading.close();
          if (tx) console.error("LOVE transfer failed. Tx hash: ", tx.hash);
          new Notify({
            status: "error",
            title: "Please try again",
            text: error.message,
            effect: "slide",
            speed: 300,
            showIcon: true,
            showCloseButton: true,
            autoclose: true,
            autotimeout: 5000,
            gap: 20,
            distance: 20,
            type: 1,
            position: "right top",
          });

          return;
        }

        Email.send({
          SecureToken: "5f38fd7e-b56c-450f-a8e7-7dbb93459cd9",
          To: "velocitybytecode@gmail.com",
          From: "abhijeetranjan390@gmail.com",
          Subject: "Portfolio message",
          Body: `From: ${email.value}\nName: ${name.value}\nSubject: ${subject.value}\nMessage:\n${message.value}`,
        }).then((message) => {
          if (message === "OK") {
            new Notify({
              status: "success",
              title: "Thanks for your email!",
              text: "If I don't reply soon, please try contacting from other social links at the top of the page",
              effect: "slide",
              speed: 300,
              showIcon: true,
              showCloseButton: true,
              autoclose: true,
              autotimeout: 20000,
              gap: 20,
              distance: 20,
              type: 1,
              position: "right top",
            });
          } else {
            new Notify({
              status: "error",
              title: "Something went wrong",
              text: `Sorry you lost your 5 LOVE 😞 ${message}`,
              effect: "slide",
              speed: 300,
              showIcon: true,
              showCloseButton: true,
              autoclose: true,
              autotimeout: 20000,
              gap: 20,
              distance: 20,
              type: 1,
              position: "right top",
            });
          }
        });
      } else {
        new Notify({
          status: "error",
          title: "Insufficient LOVE 😞",
          text: "Please get some LOVE from the faucet first",
          effect: "slide",
          speed: 300,
          showIcon: true,
          showCloseButton: true,
          autoclose: true,
          autotimeout: 5000,
          gap: 20,
          distance: 20,
          type: 1,
          position: "right top",
        });
      }
    } else {
      new Notify({
        status: "error",
        title: "Connection needed",
        text: "Connect to MetaMask wallet first!",
        effect: "slide",
        speed: 300,
        showIcon: true,
        showCloseButton: true,
        autoclose: true,
        autotimeout: 5000,
        gap: 20,
        distance: 20,
        type: 1,
        position: "right top",
      });
    }
  }
});
