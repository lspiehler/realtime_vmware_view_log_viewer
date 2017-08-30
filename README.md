Simple Node.js/Mongo Realtime Log Viewer/Archiver Web Interface for VMware Horizon View. Logs can be filtered on selected attributes and can be viewed in realtime or searched from the Mongo database. The Vmware View environment will need to point the this service as a syslog server. Change httpslistenport, sysloglistenport, and domain for your environment.

Installation:

git clone https://github.com/lspiehler/realtime_vmware_view_log_viewer.git
cd realtime_vmware_view_log_viewer
npm install
node index.js
