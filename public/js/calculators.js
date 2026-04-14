function formatCurrency(value) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);
}

function renderFeeResult(form) {
  const price = Number(form.price.value);
  const rate = Number(form.rate.value);
  const brokerageFee = price * (rate / 100);
  const vat = brokerageFee * 0.1;
  const total = brokerageFee + vat;

  return `
    <h3>계산 결과</h3>
    <p>예상 중개보수: <strong>${formatCurrency(brokerageFee)}</strong></p>
    <p>부가세(10%): <strong>${formatCurrency(vat)}</strong></p>
    <p>총 예상 비용: <strong>${formatCurrency(total)}</strong></p>
  `;
}

function renderLoanResult(form) {
  const principal = Number(form.principal.value);
  const annualRate = Number(form.rate.value);
  const months = Number(form.months.value);
  const monthlyRate = annualRate / 12 / 100;

  let monthlyPayment = 0;

  if (monthlyRate === 0) {
    monthlyPayment = principal / months;
  } else {
    monthlyPayment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;

  return `
    <h3>계산 결과</h3>
    <p>월 예상 납입액: <strong>${formatCurrency(monthlyPayment)}</strong></p>
    <p>총 상환액: <strong>${formatCurrency(totalPayment)}</strong></p>
    <p>총 이자 부담: <strong>${formatCurrency(totalInterest)}</strong></p>
  `;
}

function renderRentBuyResult(form) {
  const deposit = Number(form.deposit.value);
  const monthlyRent = Number(form.monthlyRent.value);
  const buyPrice = Number(form.buyPrice.value);
  const years = Number(form.years.value);
  const growthRate = Number(form.growthRate.value) / 100;
  const investmentRate = Number(form.investmentRate.value) / 100;

  const rentTotalPaid = monthlyRent * 12 * years;
  const depositFutureValue = deposit * Math.pow(1 + investmentRate, years);
  const rentNetPosition = depositFutureValue - deposit - rentTotalPaid;

  const buyFutureValue = buyPrice * Math.pow(1 + growthRate, years);
  const buyNetPosition = buyFutureValue - buyPrice;

  const recommendation =
    buyNetPosition >= rentNetPosition
      ? "현재 가정에서는 매매 쪽이 더 유리합니다."
      : "현재 가정에서는 월세 유지가 더 유리합니다.";

  return `
    <h3>비교 결과</h3>
    <p>월세 시 순자산 변화: <strong>${formatCurrency(rentNetPosition)}</strong></p>
    <p>매매 시 순자산 변화: <strong>${formatCurrency(buyNetPosition)}</strong></p>
    <p>예상 매매 자산 가치: <strong>${formatCurrency(buyFutureValue)}</strong></p>
    <p class="result-highlight">${recommendation}</p>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("[data-calculator]");

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const calculatorType = form.dataset.calculator;
      const resultBox = document.querySelector(`[data-result='${calculatorType}']`);

      if (!resultBox) {
        return;
      }

      if (calculatorType === "fee") {
        resultBox.innerHTML = renderFeeResult(form);
      }

      if (calculatorType === "loan") {
        resultBox.innerHTML = renderLoanResult(form);
      }

      if (calculatorType === "rent-buy") {
        resultBox.innerHTML = renderRentBuyResult(form);
      }
    });
  });
});
