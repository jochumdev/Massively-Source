function pathIsCurrent(path) {
  const u = new URL(window.location.href);

  var cu = u.pathname;
  if (path.includes("#")) {
    cu += u.hash;
  }

  return cu === path;
}

export default { pathIsCurrent };
