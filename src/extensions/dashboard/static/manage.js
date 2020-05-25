/*
  Functionality for config reading & updates.
*/

// Gets a server's config
async function getConfig(id) {
  const body = await fetch(`/api/getconfig/${id}`, { credentials: "include" }).then(async res => await res.json().catch(() => {}));
  return body;
}

// Updates a config
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

// Old cfg
let oldcfg;

// Adds the event listener
window.addEventListener("load", async () => {
  // Sets the setup items
  const id = /manage\/([\d]{17,19})/.exec(document.URL)[1];
  let res = await fetch(`/api/getitems`, { credentials: "include" });
  const dbitems = await res.json();
  res = await fetch("/api/getitems?commands=true", { credentials: "include" });
  const cmds = await res.json();
  const items = dbitems.map(p => p.id);
  if (!id) return;
  // Looks for cfg
  let cfg = await getConfig(id);
  oldcfg = { ...cfg };

  // Hides elements when not necessary
  function hideElements() {
    // Hides spamPunishments
    if (typeof cfg.antiSpam === "boolean") {
      document.getElementById("spamPunishments").parentElement.parentElement.children[2].hidden = !cfg.antiSpam;
      document.getElementById("spamPunishments").parentElement.hidden = !cfg.antiSpam;
    }

    // Hides invitePunishments
    if (typeof cfg.antiInvite === "boolean") {
      document.getElementById("invitePunishments").parentElement.parentElement.children[1].hidden = !cfg.antiInvite;
      document.getElementById("invitePunishments").parentElement.hidden = !cfg.antiInvite;
    }

    // Hides custom joinLeave messages
    document.getElementById("joinMessage").parentElement.parentElement.hidden = document.querySelector("#leaveJoin > select").value === "None";
    document.getElementById("leaveMessage").parentElement.parentElement.hidden = document.querySelector("#leaveJoin > select").value === "None";
  }

  // Blank cfg
  if (!cfg) cfg = {};
  hideElements();

  // Adds input listener
  [document.getElementById("prefix"), document.getElementById("joinMessage"), document.getElementById("leaveMessage")].forEach(d => {
    d.addEventListener("input", (starget) => {
      const e = starget.target;
      if (e.id === "prefix" && e.value.length > 15) e.value = e.value.substring(0, 15);
      if (e.id === "joinMessage" && e.value.length > 100) e.value = e.value.substring(0, 100);
      if (e.id === "leaveMessage" && e.value.length > 100) e.value = e.value.substring(0, 100);
    });
  });

  // Gets each element
  Object.keys(cfg).forEach(p => {
    const element = document.getElementById(p);
    if (!element && p !== "disabledCategories") return;
    const type = dbitems.find(pr => pr.id === p).type;

    // Boolean checker
    if (type === "bool") {
      if (cfg[p]) document.getElementById(p).children[0].children[0].checked = true;
      else document.getElementById(p).children[1].children[0].checked = true;
    }

    // Checks number content
    if (type === "number") {
      document.getElementById(p).children[0].value = Array.from(document.getElementById(p).children[0].children).find(n => n.innerText.split(" ")[0] === `${cfg[p]}`).innerText;
    }

    // Checks for ticked punishments
    if (type === "punishment") {
      cfg[p].forEach(punishment => {
        if (punishment === "Purge") document.getElementById(p).children[0].checked = true;
        if (punishment === "Mute") document.getElementById(p).children[2].checked = true;
        if (punishment === "Warn") document.getElementById(p).children[4].checked = true;
      });
    }

    // Gets the channel/roleID from content
    if (type === "channelID" || type === "roleID") {
      const opt = Array.from(element.children[0].children).find(a => a.id === cfg[p]);
      if (!opt) return;
      document.getElementById(p).children[0].value = opt.innerText;
    }

    // Sets string; emoji as content
    if (type === "string") element.value = cfg[p];
    if (type === "emoji") element.innerHTML = cfg[p];

    // Sets RoleArray as content
    if (type === "roleArray") {
      if (typeof cfg[p] !== "object") cfg[p] = [cfg[p]];
      const roles = [];
      const cc = [];
      const multiselect = Array.from(document.querySelector(`#${p} > div > div > ul`).children);

      // Pushes the roles
      multiselect.forEach(e => {
        if (!e.children[0]) return;
        roles.push(e.children[0].children[0].value);
      });

      // Role IDs
      roles.forEach(r => {
        const id = /.{1,32} \(([0-9]{16,19})\)/.exec(r)[1];
        if (cfg[p] && cfg[p].includes(id)) cc.push(r);
      });

      // Sets the selected items
      $(document.getElementById(p).children[0]).multipleSelect("setSelects", cc);
    }


    // Sets ChannelArray as content
    if (type === "channelArray") {
      if (typeof cfg[p] !== "object") cfg[p] = [cfg[p]];
      const channels = [];
      const cc = [];
      const multiselect = Array.from(document.querySelector(`#${p} > div > div > ul`).children);

      // Pushes the channels
      multiselect.forEach(e => {
        if (!e.children[0]) return;
        channels.push(e.children[0].children[0].value);
      });

      // Channel IDs
      channels.forEach(c => {
        const id = /.{1,32} \(([0-9]{16,19})\)/.exec(c)[1];
        if (cfg[p] && cfg[p].includes(id)) cc.push(c);
      });

      // Sets the selected items
      $(document.getElementById(p).children[0]).multipleSelect("setSelects", cc);
    }

    // Disabled command selector
    if (p === "disabledCmds") {
      $("#disabledCmds > select").multipleSelect("setSelects", [...cfg[p], ...$("#disabledCmds > select").multipleSelect("getSelects")]);
    }

    // Disabled categories selector
    if (p === "disabledCategories") {
      let cc = $("#disabledCmds > select").multipleSelect("getSelects");
      // Selects disabled cmds
      cfg[p].forEach(cat => {
        const dcmds = cmds.find(cmd => cmd.label === cat).children.map(child => child.value);
        cc = [...dcmds, ...cc];
      });
      $("#disabledCmds > select").multipleSelect("setSelects", cc);
    }
  });

  // Refreshes local cfg
  function refreshConfig() {
    items.forEach(p => {
      // Gets the items
      const type = dbitems.find(c => c.id === p).type;
      const element = document.getElementById(p);
      if (!element) return;

      // Sets booleans in cfg
      if (type === "bool") {
        cfg[p] = document.getElementById(p).children[0].children[0].checked;
      }

      // Sets numbers in cfg
      if (type === "number") {
        cfg[p] = parseInt(document.getElementById(p).children[0].value.split(" ")[0]);
      }

      // Sets punishment types in cfg
      if (type === "punishment") {
        const Purge = document.getElementById(p).children[0].checked;
        const Mute = document.getElementById(p).children[2].checked;
        const Warn = document.getElementById(p).children[4].checked;
        cfg[p] = [];
        if (Purge) cfg[p].push("Purge");
        if (Mute) cfg[p].push("Mute");
        if (Warn) cfg[p].push("Warn");
      }

      // Sets channels/roles in cfg
      if (type === "channelID" || type === "roleID") {
        const r = Array.from(element.children[0].children).find(a => a.innerText === element.children[0].value).id;
        cfg[p] = !r || r.toLowerCase() === "none" ? null : r;
      }

      // Sets string; emoji in cfg
      if (type === "string") cfg[p] = element.value;
      if (type === "emoji") cfg[p] = element.innerHTML;

      // Sets roles in cfg
      if (type === "roleArray") {
        const values = $(document.getElementById(p).children[0]).val();
        const ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        cfg[p] = ids;
      }

      // Sets channels in cfg
      if (type === "channelArray") {
        const values = $(document.getElementById(p).children[0]).val();
        const ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        cfg[p] = ids;
      }
    });

    // Selected disabled items
    const disabledcats = [];
    const disabledcmds = $("#disabledCmds > select").multipleSelect("getSelects");

    // Pushes each item
    document.querySelector("#disabledCmds > div > div > ul").children.forEach(c => {
      if (c.children.length && c.children[0].classList[0] && c.children[0].children[0].checked)
        disabledcats.push(c.children[0].innerText.replace(/\s/g, ""));
    });

    // Sets disabled items in cfg
    cfg.disabledCmds = disabledcmds.filter(cmd => !disabledcats.includes(cmds.find(c => c.children.find(child => child.value === cmd)).label));
    cfg.disabledCategories = disabledcats;
  }

  // Submission button functionality
  document.getElementById("submit").addEventListener("click", async () => {
    const button = document.getElementById("submit");
    // Loading animation
    button.classList.add("is-loading");
    // Refreshes config
    refreshConfig();
    oldcfg = { ...cfg };
    // Updates config
    updateConfig(id, cfg).then((res) => {
      if (res.status === 200) {
        // Button animation & changes
        button.classList.remove("is-loading");
        button.classList.remove("is-light");
        button.classList.add("is-success");
        document.getElementById("saved").innerText = "Changes saved";
        setTimeout(() => {
          document.getElementById("saved").innerText = "Save changes";
          button.classList.remove("is-success");
        }, 2000);
      } else {
        // Displays if error (user likely not authed)
        document.getElementById("saved").innerText = "Error, please refresh";
        button.classList.add("is-error");
        button.classList.remove("is-success");
      }
    });
  });

  // Config changes
  function cfgDiff() {
    // Refreshes config; hides elements
    refreshConfig();
    hideElements();
    // Compares objects; leave confirmation
    if (JSON.stringify(oldcfg) !== JSON.stringify(cfg)) window.onbeforeunload = function() {
      return "Do you really want to leave?";
    };
    else window.onbeforeunload = null;
  }

  // Event listeners
  document.addEventListener("click", cfgDiff);
  document.addEventListener("input", cfgDiff);
});
