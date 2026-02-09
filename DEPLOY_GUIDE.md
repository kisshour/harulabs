# 하루랩스(HaruLabs) 웹사이트 배포 가이드

이 가이드는 GitHub와 Vercel을 사용하여 웹사이트를 배포하고, 구매하신 도메인을 연결하는 방법을 단계별로 설명합니다.

## 1. Git 설정 및 초기 커밋

현재 컴퓨터에 Git 사용자 정보가 설정되어 있지 않습니다. 터미널(PowerShell)에 아래 명령어들을 순서대로 입력하여 설정해주세요.

**1.1 사용자 이름 및 이메일 설정**
(본인의 실제 GitHub 계정 정보로 변경해서 입력해주세요)
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**1.2 변경 사항 저장(커밋)**
```powershell
git commit -m "Initial commit"
```

---

## 2. GitHub 저장소 생성 및 업로드

1. **[GitHub](https://github.com/)**에 로그인합니다.
2. 우측 상단의 **+** 버튼을 누르고 **New repository**를 선택합니다.
3. **Repository name**에 `harulabs-web` (또는 원하는 이름)을 입력합니다.
4. **Public** (공개) 또는 **Private** (비공개) 중 원하는 것을 선택합니다.
5. **Create repository** 버튼을 클릭합니다.
6. 생성 후 나오는 화면에서 **"…or push an existing repository from the command line"** 섹션의 코드를 복사하거나, 아래 명령어를 터미널에 입력합니다.

```powershell
git remote add origin https://github.com/사용자아이디/저장소이름.git
git branch -M main
git push -u origin main
```
*(GitHub 로그인 창이 뜨면 로그인해 주세요)*

---

## 3. Vercel 배포

1. **[Vercel](https://vercel.com/)**에 로그인합니다 (GitHub 계정으로 로그인 추천).
2. 대시보드 우측 상단의 **Add New...** 버튼 클릭 -> **Project** 선택.
3. **Import Git Repository** 화면에서 방금 올린 `harulabs-web` 저장소 옆의 **Import** 버튼을 클릭합니다.
4. 설정 화면에서 특별히 건드릴 것은 없습니다. (`Framework Preset`이 **Vite**로 자동 잡혀있는지 확인)
5. **Deploy** 버튼을 클릭합니다.
6. 잠시 기다리면 배포가 완료되고 축하 화면이 나옵니다!

---

## 4. 커스텀 도메인 연결

구매하신 도메인을 Vercel 프로젝트에 연결하는 방법입니다.

1. Vercel 프로젝트 대시보드로 이동합니다.
2. 상단 탭에서 **Settings**를 클릭합니다.
3. 좌측 메뉴에서 **Domains**를 선택합니다.
4. 입력창에 구매한 도메인(예: `harulabs.com`)을 입력하고 **Add**를 클릭합니다.
5. **Recommended** 옵션(보통 `www` 포함)을 선택하고 **Add**를 누릅니다.

### 4.1 DNS 설정 (도메인 구입처에서 설정)

Vercel 화면에 **Invalid Configuration** 또는 붉은색 에러 메시지와 함께 필요한 DNS 레코드 정보가 뜹니다.

1. **도메인을 구매한 사이트** (가비아, 후이즈, 고대디 등)에 로그인합니다.
2. **DNS 설정** 또는 **네임서버 설정** 메뉴를 찾습니다.
3. Vercel에서 알려주는 값을 추가합니다. 보통 아래 두 가지 중 하나입니다:

**A 레코드 방식 (루트 도메인 연결 시):**
*   **타입(Type)**: `A`
*   **호스트(Host)**: `@` (또는 빈칸)
*   **값/IP(Value)**: `76.76.21.21` (Vercel IP)

**CNAME 방식 (www 서브도메인 연결 시):**
*   **타입(Type)**: `CNAME`
*   **호스트(Host)**: `www`
*   **값/타겟(Value)**: `cname.vercel-dns.com`

> **참고:** DNS 설정이 전 세계에 반영되는 데는 짧게는 몇 분, 길게는 최대 48시간이 걸릴 수 있습니다.

---

모든 설정이 완료되면 구매하신 도메인으로 접속했을 때 사이트가 정상적으로 보일 것입니다!
