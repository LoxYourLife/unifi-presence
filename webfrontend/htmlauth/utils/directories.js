const path = require('path');
module.exports = () => {
  const PRODUCTION = process.env.NODE_ENV === 'production';
  if (PRODUCTION) {
    return {
      config: 'REPLACELBPCONFIGDIR',
      data: 'REPLACELBPDATADIR',
      bin: 'REPLACELBPBINDIR',
      homedir: process.env.LBHOMEDIR
    };
  }
  return {
    config: path.join(__dirname, '../../../config'),
    data: path.join(__dirname, '../../../data'),
    bin: path.join(__dirname, '../../../bin'),
    homedir: path.join(__dirname, '../../../loxberry')
  };
};
