function pathIsCurrent(path) {
  const u = new URL(window.location.href);

  var cu = u.pathname;
  if (path.includes("#")) {
    cu += u.hash;
  }

    return cu === path || cu.substring(0, path.length) === path;
};

export default { pathIsCurrent };
