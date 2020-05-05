$(async () => {
  const res = await fetch(`../../api/getitems?commands=true`, {
    credentials: "include",
  });
  const cmds = await res.json();
  const baseOptions = {
    selectAll: false,
    width: 153,
    placeholder: "None",
    onOpen: () => {
      // Opening & closing
      document.getElementsByClassName("ms-choice")[0].style["border-color"] = "#1abc9c";
      document.getElementsByClassName("ms-choice")[0].style.boxShadow = "0 0 0 0.125em rgba(26, 188, 156, .25)";
    },
    onClose: () => {
      document.getElementsByClassName("ms-choice")[0].style["border-color"] = "";
      document.getElementsByClassName("ms-choice")[0].style.boxShadow = "";
    },
  };
  // Disabled cmds
  $("#disabledCmds > select").multipleSelect({
    ...baseOptions,
    data: cmds,
    filter: true,
    formatCountSelected: (count) => {
      const disabledcats = [];
      document.querySelector("#disabledCmds > div > div > ul").children.forEach(c => {
        if (c.children.length && c.children[0].classList[0] && c.children[0].children[0].checked)
          disabledcats.push(c.children[0].innerText.replace(/\s/g, ""));
      });
      if (!disabledcats.length) return `${count} Commands`;
      return disabledcats.join(", ");
    },
  });
  // Autoroles
  $("#autoRoles > select").multipleSelect({
    ...baseOptions,
    minimumCountSelected: 1,
    onClick: () => {
      if ($("#autoRoles > select").val().length > 2) {
        const values = $("#autoRoles > select").val();
        values.length = 2;
        $(document.getElementById("autoRoles").children[0]).multipleSelect("setSelects", values);
      }
    },
    formatCountSelected: (count) => {
      return `${count} Roles selected`;
    },
  });
});
