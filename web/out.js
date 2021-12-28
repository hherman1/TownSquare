(() => {
  // web/src/config.ts
  function throwIfNull(element) {
    if (element == null) {
      throw "required element was null";
    }
    return element;
  }
  var conn = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port + window.location.pathname + "sock");
  var renderTarget = throwIfNull(document.getElementById("renderTarget"));
  var textInput = throwIfNull(document.getElementById("textInput"));
  var sendTextButton = throwIfNull(document.getElementById("sendText"));
  var title = throwIfNull(document.getElementById("title"));
  var colorPickerToggler = throwIfNull(document.getElementById("picker-toggle"));
  var colorLine = throwIfNull(document.getElementById("color-line"));
  var helpToggle = throwIfNull(document.getElementById("help"));
  var helpClose = throwIfNull(document.getElementById("helpTooltipCloseButton"));
  var helpTooltip = throwIfNull(document.getElementById("helpTooltip"));
  var firstTimePlaying = true;
  function checkFirstTime() {
    let res = window.localStorage.getItem("firstTime");
    if (res == null) {
      window.localStorage.setItem("firstTime", JSON.stringify(true));
      return;
    } else {
      firstTimePlaying = false;
    }
  }
  if (window.localStorage) {
    checkFirstTime();
  }

  // web/src/client.ts
  function updateSelfWithServer(self2) {
    let Sender = self2.Sender;
    self2.Sender = void 0;
    conn.send(JSON.stringify(self2));
    self2.Sender = Sender;
  }
  function setUserPosPixels(u, x, y) {
    u.Pos.X = x / renderTarget.clientWidth;
    u.Pos.Y = y / renderTarget.clientHeight;
  }

  // web/src/render.ts
  function complement(col) {
    return {
      R: 255 - col.R,
      G: 255 - col.G,
      B: 255 - col.B
    };
  }
  function IDFromUUID(uuid) {
    return "gameID-" + uuid;
  }
  function getID(u) {
    return IDFromUUID(u.Sender);
  }
  function getUserDOM(u) {
    return document.getElementById(getID(u));
  }
  function getUserDOMByUUID(uuid) {
    return document.getElementById(IDFromUUID(uuid));
  }
  function makeUserDOM(u) {
    let el = document.createElement("div");
    el.className = "user-el";
    el.id = getID(u);
    let visual = document.createElement("div");
    visual.className = "user-visual";
    el.appendChild(visual);
    let anim = document.createElement("div");
    anim.className = "user-anim";
    visual.appendChild(anim);
    let dot = document.createElement("div");
    dot.className = "user-dot";
    let textBlock = document.createElement("div");
    textBlock.className = "user-text";
    anim.appendChild(dot);
    anim.appendChild(document.createElement("br"));
    anim.appendChild(textBlock);
    setUserDOMAttributes(el, u);
    anim.addEventListener("animationend", function(e) {
      anim.classList.remove("notify");
    });
    return el;
  }
  function setUserDOMAttributes(el, u) {
    el.style.transform = "translate(" + u.Pos.X * 100 + "%," + u.Pos.Y * 100 + "%)";
    let anim = throwIfNull(throwIfNull(el.firstChild).firstChild);
    let dot = throwIfNull(anim.firstChild);
    dot.style.backgroundColor = "rgb(" + Math.round(u.Color.R) + "," + Math.round(u.Color.G) + "," + Math.round(u.Color.B) + ")";
    let textDiv = throwIfNull(anim.lastChild);
    textDiv.textContent = u.Text;
  }
  function renderUser(u) {
    let el = getUserDOM(u);
    if (el == null) {
      let newEl = makeUserDOM(u);
      renderTarget.appendChild(newEl);
    } else {
      setUserDOMAttributes(el, u);
    }
  }
  function renderUserNotification(u) {
    let el = getUserDOM(u);
    if (el != null) {
      let anim = throwIfNull(throwIfNull(el.firstChild).firstChild);
      anim.classList.add("notify");
    }
  }
  function deleteUserByUUID(uuid) {
    let el = getUserDOMByUUID(uuid);
    if (el != null) {
      let anim = throwIfNull(throwIfNull(el.firstChild).firstChild);
      anim.classList.add("deleting");
      anim.addEventListener("animationend", function() {
        if (el != null) {
          throwIfNull(el.parentNode).removeChild(el);
        }
      });
    }
  }
  function disableTransitions(u) {
    let el = throwIfNull(getUserDOM(u));
    el.style.transition = "none";
    let anim = throwIfNull(throwIfNull(el.firstChild).firstChild);
    let dot = throwIfNull(anim.firstChild);
    dot.style.transition = "none";
  }
  function renderDragUser(u) {
    let el = getUserDOM(u);
    if (el != null) {
      let anim = throwIfNull(throwIfNull(el.firstChild).firstChild);
      anim.classList.add("dragging");
      let dot = throwIfNull(anim.firstChild);
      dot.style.borderColor = colorString(complement(u.Color));
    }
  }
  function stopDragUser(u) {
    let el = getUserDOM(u);
    if (el != null) {
      let anim = throwIfNull(throwIfNull(el.firstChild).firstChild);
      anim.classList.remove("dragging");
      let dot = throwIfNull(anim.firstChild);
      dot.style.borderColor = "black";
    }
  }
  function hideCursor() {
    renderTarget.classList.add("hide-mouse");
  }
  function showCursor() {
    renderTarget.classList.remove("hide-mouse");
  }
  function colorString(col) {
    return "rgb(" + col.R + "," + col.G + "," + col.B + ")";
  }
  function setUIColor(u) {
    title.style.color = colorString(u.Color);
    colorPickerToggler.style.borderColor = colorString(u.Color);
  }
  function showTooltip() {
    helpTooltip.classList.remove("hide");
  }
  function hideTooltip() {
    helpTooltip.classList.add("hide");
  }
  function renderTooltip(visible) {
    if (visible) {
      showTooltip();
    } else {
      hideTooltip();
    }
  }

  // web/src/main.ts
  conn.onmessage = function(msg) {
    let us = JSON.parse(msg.data);
    us.forEach(function(u) {
      if (u.Pos != void 0) {
        let user = u;
        renderUser(user);
        renderUserNotification(user);
      } else if (u.Identity != void 0) {
        self.Sender = u.Identity;
        main();
      } else if (u.Closing != void 0) {
        deleteUserByUUID(u.Closing);
      }
    });
  };
  function randomColor() {
    return Math.round(Math.random() * 255);
  }
  var self;
  self = {
    Color: {
      R: randomColor(),
      G: randomColor(),
      B: randomColor()
    },
    Pos: {
      X: 0.5,
      Y: 0.5
    },
    Text: "Hello world!",
    Sender: void 0
  };
  function main() {
    renderUser(self);
    setUIColor(self);
    disableTransitions(self);
    updateSelfWithServer(self);
  }
  var mouse = {
    down: false
  };
  renderTarget.addEventListener("mousedown", function(e) {
    mouse.down = true;
    setUserPosPixels(self, e.offsetX, e.offsetY);
    renderUser(self);
    renderDragUser(self);
    hideCursor();
  });
  renderTarget.addEventListener("mousemove", function(e) {
    if (mouse.down) {
      setUserPosPixels(self, e.offsetX, e.offsetY);
      renderUser(self);
    }
  });
  renderTarget.addEventListener("mouseup", function(e) {
    setUserPosPixels(self, e.offsetX, e.offsetY);
    updateSelfWithServer(self);
    mouse.down = false;
    stopDragUser(self);
    showCursor();
  });
  document.addEventListener("keypress", function(e) {
    if (e.key == "Enter")
      textInput.focus();
  });
  function sendText() {
    if (textInput.value.trim().length > 0) {
      self.Text = textInput.value;
      updateSelfWithServer(self);
    }
    textInput.value = "";
    textInput.focus();
  }
  textInput.addEventListener("keypress", function(e) {
    if (e.key == "Enter") {
      sendText();
    }
  });
  sendTextButton.addEventListener("click", function(e) {
    sendText();
  });
  var colorLineVisible = false;
  colorPickerToggler.addEventListener("click", function() {
    if (colorLineVisible) {
      colorLine.classList.add("hide");
    } else {
      colorLine.classList.remove("hide");
    }
    colorLineVisible = !colorLineVisible;
  });
  function calcGradient(p) {
    let colors = [[75, 0, 130], [0, 191, 255], [144, 238, 144], [255, 255, 0], [255, 165, 0], [255, 0, 0]];
    let interval = 1 / (colors.length - 1);
    let index = Math.floor(p / interval);
    if (index == colors.length - 1) {
      index--;
    }
    let fixedP = (p - index * interval) / interval;
    let colorA = colors[index];
    let colorB = colors[index + 1];
    return [
      colorA[0] + fixedP * (colorB[0] - colorA[0]),
      colorA[1] + fixedP * (colorB[1] - colorA[1]),
      colorA[2] + fixedP * (colorB[2] - colorA[2])
    ];
  }
  var colorLineDown = false;
  function setColorFromLine(y) {
    let p = y / colorLine.clientHeight;
    if (p < 0 || p > 1) {
      return;
    }
    let col = calcGradient(p);
    self.Color = {
      R: Math.round(col[0]),
      G: Math.round(col[1]),
      B: Math.round(col[2])
    };
    renderUser(self);
    setUIColor(self);
  }
  colorLine.addEventListener("mousedown", function(e) {
    colorLineDown = true;
    setColorFromLine(e.offsetY);
  });
  colorLine.addEventListener("mousemove", function(e) {
    if (colorLineDown) {
      setColorFromLine(e.offsetY);
    }
  });
  colorLine.addEventListener("mouseup", function(e) {
    colorLineDown = false;
    setColorFromLine(e.offsetY);
    updateSelfWithServer(self);
  });
  var helpTooltipVisible = firstTimePlaying;
  renderTooltip(helpTooltipVisible);
  helpClose.addEventListener("click", function() {
    helpTooltipVisible = false;
    renderTooltip(helpTooltipVisible);
  });
  helpToggle.addEventListener("click", function() {
    helpTooltipVisible = !helpTooltipVisible;
    renderTooltip(helpTooltipVisible);
  });
})();
