---
name: "Go Network Tunneling System"
description: "A network tunneling system that isolates internal services from external networks and selectively permits traffic."
href: "https://github.com/citrusinesis/network-tunneler"
order: 0
role: "Personal project"
printSummary:
  - "Designed a three-tier architecture with Client (Data Plane), Server (Control Plane), and Proxy components communicating over gRPC."
  - "Controlled low-level network packets through pkg/network and pkg/netfilter; generated Linux iptables rules dynamically to manage traffic."
  - "Used Go concurrency and direct packet manipulation."
---

Designed a three-tier architecture with Client (Data Plane), Server (Control Plane), and Proxy components communicating over gRPC.

Controlled low-level network packets through pkg/network and pkg/netfilter; generated Linux iptables rules dynamically to manage traffic.

Used Go concurrency and direct packet manipulation.
