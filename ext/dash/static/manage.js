/*
  Dashboard Communicator
  Functionality for config reading & updates.
*/

// Gets cfg ID
async function getConfig(id) {
  let res = await fetch(`/api/getconfig/${id}`, { credentials: "include" });
  let body = await res.json();
  return body;
}

// Update cfg
async function updateConfig(id, cfg) {
  return await fetch(`/api/updateconfig/${id}`, {
    method: "post",
    credentials: "include",
    body: JSON.stringify(cfg),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
  });
}

// Copy of the original cfg
let ocfg;

// Adds the event listener
window.addEventListener("load", async () => {
  let id = /manage\/([\d]{17,19})/.exec(document.URL)[1];
  // Sets the setup items
  let res = await fetch(`/api/getitems`, { credentials: "include" });
  let dbitems = await res.json();
  res = await fetch(`/api/getitems?commands=true`, { credentials: "include" });
  let cmds = await res.json();
  const items = dbitems.map(p => p.id);
  if (!id) return;
  // Looks for cfg
  let cfg = await getConfig(id);
  ocfg = { ...cfg };

  // Hides elements when not necessary
  function visibilityLogic() {
    // AntiSpam
    if (typeof cfg.AntiSpam === "boolean") {
      document.getElementById("spamPunishments").parentElement.parentElement.children[2].hidden = !cfg.AntiSpam;
      document.getElementById("spamPunishments").parentElement.hidden = !cfg.AntiSpam;
    }

    // InvitePunishments
    if (typeof cfg.AntiInvite === "boolean") {
      document.getElementById("invitePunishments").parentElement.parentElement.children[2].hidden = !cfg.AntiInvite;
      document.getElementById("invitePunishments").parentElement.hidden = !cfg.AntiInvite;
    }

    // Join & leave messages
    document.getElementById("joinMessage").parentElement.parentElement.hidden = document.querySelector("#leavejoin > select").value === "None";
    document.getElementById("leaveMessage").parentElement.parentElement.hidden = document.querySelector("#leavejoin > select").value === "None";
  }

  // Inserts blank cfg
  if (!cfg) cfg = {};
  visibilityLogic();

  // Limits length of the textboxes
  [document.getElementById("prefix"), document.getElementById("joinMessage"), document.getElementById("leaveMessage")].forEach(d => {
    d.addEventListener("input", (starget) => {
      let e = starget.target;
      if (e.id === "prefix" && e.value.length > 15) e.value = e.value.substring(0, 15);
      if (e.id === "joinMessage" && e.value.length > 100) e.value = e.value.substring(0, 100);
      if (e.id === "leaveMessage" && e.value.length > 100) e.value = e.value.substring(0, 100);
    });
  });

  // Gets each element & type
  Object.keys(cfg).forEach(p => {
    let element = document.getElementById(p);
    // Returns if no element
    if (!element && p !== "disabledCategories") return;
    let type = dbitems.find(pr => pr.id === p).type;
    // Booleans
    if (type === "bool") {
      if (cfg[p]) document.getElementById(p).children[0].children[0].checked = true;
      else document.getElementById(p).children[1].children[0].checked = true;
    } else if (type === "number") {
      // eslint-disable-next-line
      document.getElementById(p).children[0].value = Array.from(document.getElementById(p).children[0].children).find(n => n.innerText.split(" ")[0] == cfg[p]).innerText;
      // Punishments
    } else if (type === "punishment") {
      cfg[p].forEach(punishment => {
        if (punishment === "Purge") document.getElementById(p).children[0].checked = true;
        if (punishment === "Mute") document.getElementById(p).children[2].checked = true;
        if (punishment === "Strike") document.getElementById(p).children[4].checked = true;
      });
      // Channel/Role IDs
    } else if (type === "channelID" || type === "roleID") {
      let opt = Array.from(element.children[0].children).find(a => a.id === cfg[p]);
      if (!opt) return;
      document.getElementById(p).children[0].value = opt.innerText;
      // Strings
    } else if (type === "string") {
      element.value = cfg[p];
    } else if (type === "roleArray") {
      if (typeof cfg[p] !== "object") cfg[p] = [cfg[p]];
      let roles = [];
      let cc = [];
      // RoleArray for AutoRole
      let aSelects = Array.from(document.querySelector(`#${p} > div > div > ul`).children);
      aSelects.forEach(e => {
        if (!e.children[0]) return;
        roles.push(e.children[0].children[0].value);
      });
      roles.forEach(r => {
        let id = /.{1,32} \(([0-9]{16,19})\)/.exec(r)[1];
        if (cfg[p] && cfg[p].includes(id)) cc.push(r);
      });
      // Autoroles
      $(document.getElementById("autorole").children[0]).multipleSelect("setSelects", cc);
      // Disabled commands/categories
    } else if (p === "disabledCmds") {
      $("#disabledCmds > select").multipleSelect("setSelects", [...cfg[p], ...$("#disabledCmds > select").multipleSelect("getSelects")]);
    } else if (p === "disabledCategories") {
      let cc = $("#disabledCmds > select").multipleSelect("getSelects");
      cfg[p].forEach(cat => {
        let ccmds = cmds.find(cmd => cmd.label === cat).children.map(child => child.value);
        cc = [...ccmds, ...cc];
      });
      $("#disabledCmds > select").multipleSelect("setSelects", cc);
    }
  });

  // Refreshes local cfg
  function refreshLocalConfig() {
    items.forEach(p => {
      // Gets the items
      let type = dbitems.find(c => c.id === p).type;
      let element = document.getElementById(p);
      // Returns if no element
      if (!element) return;
      // Booleans
      if (type === "bool") {
        cfg[p] = document.getElementById(p).children[0].children[0].checked;
        // Numbers
      } else if (type === "number") {
        cfg[p] = parseInt(document.getElementById(p).children[0].value.split(" ")[0]);
        // Punishments
      } else if (type === "punishment") {
        let Purge = document.getElementById(p).children[0].checked;
        let Mute = document.getElementById(p).children[2].checked;
        let Strike = document.getElementById(p).children[4].checked;
        cfg[p] = [];
        if (Purge) cfg[p].push("Purge");
        if (Mute) cfg[p].push("Mute");
        if (Strike) cfg[p].push("Strike");
        // Channel/Role IDs
      } else if (type === "channelID" || type === "roleID") {
        let r = Array.from(element.children[0].children).find(a => a.innerText === element.children[0].value).id;
        cfg[p] = !r || r.toLowerCase() === "none" ? null : r;
      } else if (type === "string") {
        cfg[p] = element.value;
        // RoleArray
      } else if (type === "roleArray") {
        let values = $(document.getElementById(p).children[0]).val();
        let ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        cfg[p] = ids;
      }
    });
    // Disabled commands/categories
    let disabledcats = [];
    let disabledcmds = $("#disabledCmds > select").multipleSelect("getSelects");
    document.querySelector("#disabledCmds > div > div > ul").children.forEach(c => {
      if (c.children.length && c.children[0].classList[0] && c.children[0].children[0].checked)
        disabledcats.push(c.children[0].innerText.replace(/\s/g, ""));
    });
    cfg.disabledCmds = disabledcmds.filter(cmd => !disabledcats.includes(cmds.find(c => c.children.find(child => child.value === cmd)).label));
    cfg.disabledCategories = disabledcats;
  }

  // Submission handler
  document.getElementById("submit").addEventListener("click", async () => {
    let button = document.getElementById("submit");
    button.classList.add("is-loading");
    // Refreshes local cfg
    refreshLocalConfig();
    // Updates original config
    ocfg = { ...cfg };
    // Updates cfg & button functionality
    updateConfig(id, cfg).then((res) => {
      if (res.status === 200) {
        button.classList.remove("is-loading");
        button.classList.remove("is-light");
        button.classList.add("is-success");
        document.getElementById("saved").innerText = "Configuration saved";
        setTimeout(() => {
          document.getElementById("saved").innerText = "Save configuration";
          button.classList.add("is-light");
          button.classList.remove("is-success");
        }, 2000);
      } else {
        document.getElementById("saved").innerText = "An error occurred, please refresh";
        button.classList.add("is-error");
        button.classList.remove("is-success");
      }
    });
  });

  // Differences between original & new cfgs
  function cfgDiff() {
    refreshLocalConfig();
    visibilityLogic();
    // Compares stringified objects; leave confirmation
    if (JSON.stringify(ocfg) !== JSON.stringify(cfg)) window.onbeforeunload = function() {
      return "Do you really want to leave?";
    };
    else window.onbeforeunload = null;
  }
  document.addEventListener("click", cfgDiff);
  document.addEventListener("input", cfgDiff);
});