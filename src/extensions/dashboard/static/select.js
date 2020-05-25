/*
  This updates the multiselect options.
*/

// Gets items
$(async () => {
  const cmds = await fetch(`../../api/getitems?commands=true`, {
    credentials: "include",
  }).then(async res => await res.json().catch(() => {}));

  // Sets options
  const baseOptions = {
    selectAll: false,
    width: 153,
    placeholder: "None",
    // Opening & closing
    onOpen: () => {
      document.getElementsByClassName("ms-choice")[0].style["border-color"] = "#1abc9c";
      document.getElementsByClassName("ms-choice")[0].style.boxShadow = "0 0 0 0.125em rgba(26, 188, 156, .25)";
    },
    onClose: () => {
      document.getElementsByClassName("ms-choice")[0].style["border-color"] = "";
      document.getElementsByClassName("ms-choice")[0].style.boxShadow = "";
    },
  };

  $("#disabledCmds > select").multipleSelect({
    ...baseOptions,
    data: cmds,
    filter: true,
    // Disabled categories
    formatCountSelected: (count) => {
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

    formatCountSelected: (count) => {
      return `${count} selected`;
    },
  });

  $("#assignableRoles > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#assignableRoles > select").val()) {
        $(document.getElementById("assignableRoles").children[0]).multipleSelect("setSelects", values);
      }
    },

    formatCountSelected: (count) => {
      return `${count} selected`;
    },
  });

  $("#snipingIgnore > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#snipingIgnore > select").val()) {
        const values = $("#snipingIgnore > select").val();
        $(document.getElementById("snipingIgnore").children[0]).multipleSelect("setSelects", values);
      }
    },

    formatCountSelected: (count) => {
      return `${count} selected`;
    },
  });
});
