/* jshint node:true */

module.exports = {
  port: 59241,
  startingPort: 3000,
  excludedPorts: [5984, 9200, 9300],
  session: {
    key: 'atlas.id',
    secret: 'secret'
  },
  user: {
    name: 'admin',
    pass: 'admin'
  },
  project_dir: '/opt/nodejs/',
  nginx_dir: '/etc/nginx/conf.d/',
  nginx_bin: '/usr/sbin/nginx'
};
