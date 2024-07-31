import { networkInterfaces } from 'node:os'

function getLocalhostAddress() {
  const interfaces = networkInterfaces()
  const address = Object.keys(interfaces)
    .flatMap(name => interfaces[name] ?? [])
    .filter(iface => iface?.family === 'IPv4' && !iface.internal)
    .map(iface => iface?.address)
    .filter(Boolean)
  return address
}

console.log(getLocalhostAddress())
