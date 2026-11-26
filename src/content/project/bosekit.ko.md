---
name: "BoseKit"
description: "Bluetooth로 Bose 헤드폰과 이어버드를 제어하는 비공식 macOS 메뉴바 앱 및 Swift 라이브러리."
href: "https://github.com/citrusinesis/BoseKit"
order: 1
role: "개인 프로젝트"
---

공식 Bose 앱 없이 Bluetooth로 Bose 헤드폰과 이어버드를 제어하는 macOS 메뉴바 앱 및 Swift 라이브러리입니다.

Bluetooth RFCOMM 전송 계층·프로토콜 인코딩·기기 프로파일·쓰기 후 read-back 검증을 담당하는 `BoseKitEngine` Swift 패키지, 기기 응답을 확인하는 CLI 도구 `BoseKitProbe`, 영어·한국어를 지원하는 SwiftUI 메뉴바 앱 `BoseKit`으로 구성했습니다.

청취 모드, 노이즈 캔슬링 및 주변음 제어, 이퀄라이저, 멀티포인트 상태, 기기 설정을 지원하며, `bosectl`의 프로토콜 사양을 바탕으로 QuietComfort Ultra Headphones (1st Gen) 실기기에서 동작을 검증했습니다.
