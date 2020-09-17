/**
 * @fileoverview Multiselect handler
 * @description Handles multiple selections
 * @module webserver/select
 */

// Gets items
$(async () => {
  // Gets the csrf token
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  const cmds = await fetch("../../api/getItems?commands=true", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => res.json().catch(() => {}));

  // Sets options
  const baseOptions = {
    selectAll: false,
    placeholder: "None",
  };

  // Disabled cmds
  $("#disabledCmds > select").multipleSelect({
    ...baseOptions,
    data: cmds,
    filter: true,
    // Disabled categories
    formatCountSelected: count => {
      const disabledcats = [];
      document.querySelector("#disabledCmds > div > div > ul").children.forEach(c => {
        if (c.children.length && c.children[0].classList[0] && c.children[0].children[0].checked)
          disabledcats.push(c.children[0].innerText.replace(/\s/g, ""));
      });

      // Shows how many selected
      if (!disabledcats.length) return `${count} selected`;
      return disabledcats.join(", ");
    },
  });

  // Autoroles
  $("#autoRoles > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#autoRoles > select").val().length > 5) {
        const values = $("#autoRoles > select").val();
        values.length = 5;
        $(document.getElementById("autoRoles").children[0]).multipleSelect("setSelects", values);
      }
    },

    formatCountSelected: count => {
      return `${count} selected`;
    },
  });

  // Assignable roles
  $("#assignableRoles > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#assignableRoles > select").val()) {
        const values = $("#assignableRoles > select").val();
        $(document.getElementById("assignableRoles").children[0]).multipleSelect("setSelects", values);
      }
    },

    formatCountSelected: count => {
      return `${count} selected`;
    },
  });

  // snipingIgnore
  $("#snipingIgnore > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#snipingIgnore > select").val()) {
        const values = $("#snipingIgnore > select").val();
        $(document.getElementById("snipingIgnore").children[0]).multipleSelect("setSelects", values);
      }
    },

    formatCountSelected: count => {
      return `${count} selected`;
    },
  });

  // ignoredLoggingChannels
  $("#ignoredLoggingChannels > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#ignoredLoggingChannels > select").val()) {
        const values = $("#ignoredLoggingChannels > select").val();
        $(document.getElementById("ignoredLoggingChannels").children[0]).multipleSelect("setSelects", values);
      }
    },

    formatCountSelected: count => {
      return `${count} selected`;
    },
  });
});
