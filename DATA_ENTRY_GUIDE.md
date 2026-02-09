# 제품 데이터 입력 가이드 (Data Entry Guide)

## 1. 관리자 페이지 (추천)
가장 쉬운 방법은 **[제품 코드 생성기](/admin)** 페이지를 이용하는 것입니다.

1. 웹사이트 주소 뒤에 `/admin`을 붙여 접속하세요. (예: `http://localhost:5173/admin`)
2. 제품 정보를 입력 폼에 작성하세요.
3. 아래 **"Generate Code"** 버튼을 누르세요.
4. 생성된 코드를 복사하세요.
5. `src/data/products.js` 파일을 열고 `PRODUCTS` 배열 안에 붙여넣으세요.

---

## 2. 직접 코드 입력 (고급)
`src/data/products.js` 파일에 직접 코드를 작성할 수도 있습니다.

### 파일 위치
`src/data/products.js`

### 템플릿
```javascript
  {
    // ID 자동 생성
    id: generateSKU('THEME', 'CATEGORY', 'MATERIAL', INDEX, 'COLOR', 'SIZE'),
    name: "제품 이름",
    theme: "THEME",       // 예: 'HYPE'
    category: "CATEGORY", // 예: 'RING'
    price: 00000,
    description: "설명...",
    material: "MATERIAL", // 예: 'SILVER'
    options: [
      {
        sku: generateSKU('THEME', 'CATEGORY', 'MATERIAL', INDEX, 'COLOR', 'SIZE'),
        color: "COLOR",   // 예: 'SILVER'
        size: "SIZE",     // 예: '12'
        stock: 10,
        images: ["/assets/products/이미지.jpg"]
      }
    ]
  },
```

## 3. 결과 확인
`src/data/products.js` 파일에 제품을 추가하면 **자동으로** 다음 페이지들에 업데이트됩니다:
- **Category 페이지**: `category` 필드 값(예: `RING`, `NECKLACE`)에 맞춰 해당 카테고리 페이지에 자동 표시됩니다.
- **Collection 페이지**: `theme` 필드 값(예: `HYPE`, `AURA`)에 맞춰 해당 컬렉션 페이지에 자동 표시됩니다.
- **상세 페이지**: 제품을 클릭하면 상세 내용도 자동으로 연결됩니다.

**주의**: 파일을 저장하고 브라우저를 새로고침하면 즉시 확인 가능합니다. (배포 시에는 배포 완료 후 확인)
