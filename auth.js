
const encodedCreds = {
  u: "d2hvYW1p",       
  p: "MTI3LjAuMC4x"   
};
function decode(str) { return atob(str); }
window.AUTH = {
  username: decode(encodedCreds.u),
  password: decode(encodedCreds.p)
};
