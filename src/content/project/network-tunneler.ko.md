---
name: "Go 기반 네트워크 터널링 시스템"
description: "외부 네트워크에서 내부 서비스를 격리하고 특정 트래픽만 선택적으로 허용하는 네트워크 터널링 시스템."
href: "https://github.com/citrusinesis/network-tunneler"
order: 0
role: "개인 프로젝트"
printSummary:
  - "Client(Data Plane), Server(Control Plane), Proxy로 구성한 3-tier 아키텍처를 설계하고 gRPC 기반 통신을 구현했습니다."
  - "pkg/network와 pkg/netfilter 모듈로 저수준 네트워크 패킷을 다루고 Linux iptables 규칙을 동적으로 생성해 트래픽을 제어했습니다."
  - "Go의 동시성 처리와 패킷 직접 조작을 활용했습니다."
---

Client(Data Plane), Server(Control Plane), Proxy로 구성한 3-tier 아키텍처를 설계하고 gRPC 기반 통신을 구현했습니다.

pkg/network와 pkg/netfilter 모듈로 저수준 네트워크 패킷을 다루고 Linux iptables 규칙을 동적으로 생성해 트래픽을 제어했습니다.

Go의 동시성 처리와 패킷 직접 조작을 활용했습니다.
