/**
 * Generation XML pour factures electroniques
 * Formats supportes : UBL 2.1, UN/CEFACT CII, PEPPOL BIS 3.0
 */

import type { Invoice, InvoiceLine, InvoiceParty } from './einvoiceStorageService'

// ────────── Helpers ──────────

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatAmount(n: number): string {
  return n.toFixed(2)
}

function formatDate(d: string): string {
  // Ensure YYYY-MM-DD
  return d.split('T')[0]
}

// ────────── UBL 2.1 ──────────

function ublParty(party: InvoiceParty, tag: string): string {
  return `
    <cac:${tag}>
      <cac:Party>
        <cac:PartyName>
          <cbc:Name>${escapeXml(party.name)}</cbc:Name>
        </cac:PartyName>
        <cac:PostalAddress>
          <cbc:StreetName>${escapeXml(party.address)}</cbc:StreetName>
          <cbc:CityName>${escapeXml(party.city)}</cbc:CityName>
          <cac:Country>
            <cbc:IdentificationCode>${escapeXml(party.country)}</cbc:IdentificationCode>
          </cac:Country>
        </cac:PostalAddress>
        <cac:PartyTaxScheme>
          <cbc:CompanyID>${escapeXml(party.taxId)}</cbc:CompanyID>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:PartyTaxScheme>
        <cac:PartyLegalEntity>
          <cbc:RegistrationName>${escapeXml(party.name)}</cbc:RegistrationName>
          <cbc:CompanyID>${escapeXml(party.rccm)}</cbc:CompanyID>
        </cac:PartyLegalEntity>
        <cac:Contact>
          <cbc:Telephone>${escapeXml(party.phone)}</cbc:Telephone>
          <cbc:ElectronicMail>${escapeXml(party.email)}</cbc:ElectronicMail>
        </cac:Contact>
      </cac:Party>
    </cac:${tag}>`
}

function ublInvoiceLine(line: InvoiceLine, index: number, currency: string): string {
  return `
    <cac:InvoiceLine>
      <cbc:ID>${index + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="EA">${line.quantity}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${currency}">${formatAmount(line.totalHT)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Description>${escapeXml(line.description)}</cbc:Description>
        <cbc:Name>${escapeXml(line.description)}</cbc:Name>
        <cac:ClassifiedTaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${line.taxRate}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:ClassifiedTaxCategory>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${currency}">${formatAmount(line.unitPrice)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`
}

export function generateUBL21(invoice: Invoice): string {
  const isCredit = invoice.type === 'AVOIR'
  const docType = isCredit ? 'CreditNote' : 'Invoice'

  const lines = invoice.lines.map((l, i) => {
    if (isCredit) {
      return ublInvoiceLine(l, i, invoice.currency).replace(/InvoiceLine/g, 'CreditNoteLine').replace(/InvoicedQuantity/g, 'CreditedQuantity')
    }
    return ublInvoiceLine(l, i, invoice.currency)
  }).join('')

  // Group tax subtotals by rate
  const taxRates = [...new Set(invoice.lines.map(l => l.taxRate))]
  const taxSubtotals = taxRates.map(rate => {
    const linesForRate = invoice.lines.filter(l => l.taxRate === rate)
    const taxableAmount = linesForRate.reduce((s, l) => s + l.totalHT, 0)
    const taxAmount = linesForRate.reduce((s, l) => s + l.totalTVA, 0)
    return `
      <cac:TaxSubtotal>
        <cbc:TaxableAmount currencyID="${invoice.currency}">${formatAmount(taxableAmount)}</cbc:TaxableAmount>
        <cbc:TaxAmount currencyID="${invoice.currency}">${formatAmount(taxAmount)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID>S</cbc:ID>
          <cbc:Percent>${rate}</cbc:Percent>
          <cac:TaxScheme>
            <cbc:ID>VAT</cbc:ID>
          </cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>`
  }).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<${docType} xmlns="urn:oasis:names:specification:ubl:schema:xsd:${docType}-2"
  xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
  xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>
  <cbc:ID>${escapeXml(invoice.number)}</cbc:ID>
  <cbc:IssueDate>${formatDate(invoice.date)}</cbc:IssueDate>
  <cbc:DueDate>${formatDate(invoice.dueDate)}</cbc:DueDate>
  <cbc:${docType}TypeCode>${isCredit ? '381' : '380'}</cbc:${docType}TypeCode>
  <cbc:Note>${escapeXml(invoice.notes)}</cbc:Note>
  <cbc:DocumentCurrencyCode>${invoice.currency}</cbc:DocumentCurrencyCode>
  ${isCredit && invoice.linkedInvoiceId ? `
  <cac:BillingReference>
    <cac:InvoiceDocumentReference>
      <cbc:ID>${escapeXml(invoice.linkedInvoiceId)}</cbc:ID>
    </cac:InvoiceDocumentReference>
  </cac:BillingReference>` : ''}
  ${ublParty(invoice.seller, 'AccountingSupplierParty')}
  ${ublParty(invoice.buyer, 'AccountingCustomerParty')}
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${invoice.currency}">${formatAmount(invoice.totalTVA)}</cbc:TaxAmount>
    ${taxSubtotals}
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${invoice.currency}">${formatAmount(invoice.totalHT)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${invoice.currency}">${formatAmount(invoice.totalHT)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${invoice.currency}">${formatAmount(invoice.totalTTC)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${invoice.currency}">${formatAmount(invoice.totalTTC)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lines}
</${docType}>`
}

// ────────── UN/CEFACT CII (Cross Industry Invoice) ──────────

export function generateCII(invoice: Invoice): string {
  const lines = invoice.lines.map((l, i) => `
    <ram:IncludedSupplyChainTradeLineItem>
      <ram:AssociatedDocumentLineDocument>
        <ram:LineID>${i + 1}</ram:LineID>
      </ram:AssociatedDocumentLineDocument>
      <ram:SpecifiedTradeProduct>
        <ram:Name>${escapeXml(l.description)}</ram:Name>
      </ram:SpecifiedTradeProduct>
      <ram:SpecifiedLineTradeAgreement>
        <ram:NetPriceProductTradePrice>
          <ram:ChargeAmount>${formatAmount(l.unitPrice)}</ram:ChargeAmount>
        </ram:NetPriceProductTradePrice>
      </ram:SpecifiedLineTradeAgreement>
      <ram:SpecifiedLineTradeDelivery>
        <ram:BilledQuantity unitCode="EA">${l.quantity}</ram:BilledQuantity>
      </ram:SpecifiedLineTradeDelivery>
      <ram:SpecifiedLineTradeSettlement>
        <ram:ApplicableTradeTax>
          <ram:TypeCode>VAT</ram:TypeCode>
          <ram:CategoryCode>S</ram:CategoryCode>
          <ram:RateApplicablePercent>${l.taxRate}</ram:RateApplicablePercent>
        </ram:ApplicableTradeTax>
        <ram:SpecifiedTradeSettlementLineMonetarySummation>
          <ram:LineTotalAmount>${formatAmount(l.totalHT)}</ram:LineTotalAmount>
        </ram:SpecifiedTradeSettlementLineMonetarySummation>
      </ram:SpecifiedLineTradeSettlement>
    </ram:IncludedSupplyChainTradeLineItem>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
  xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
  xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${escapeXml(invoice.number)}</ram:ID>
    <ram:TypeCode>${invoice.type === 'AVOIR' ? '381' : '380'}</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${formatDate(invoice.date).replace(/-/g, '')}</udt:DateTimeString>
    </ram:IssueDateTime>
    <ram:IncludedNote>
      <ram:Content>${escapeXml(invoice.notes)}</ram:Content>
    </ram:IncludedNote>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${escapeXml(invoice.seller.name)}</ram:Name>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(invoice.seller.taxId)}</ram:ID>
        </ram:SpecifiedTaxRegistration>
        <ram:PostalTradeAddress>
          <ram:LineOne>${escapeXml(invoice.seller.address)}</ram:LineOne>
          <ram:CityName>${escapeXml(invoice.seller.city)}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.seller.country)}</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${escapeXml(invoice.buyer.name)}</ram:Name>
        <ram:SpecifiedTaxRegistration>
          <ram:ID schemeID="VA">${escapeXml(invoice.buyer.taxId)}</ram:ID>
        </ram:SpecifiedTaxRegistration>
        <ram:PostalTradeAddress>
          <ram:LineOne>${escapeXml(invoice.buyer.address)}</ram:LineOne>
          <ram:CityName>${escapeXml(invoice.buyer.city)}</ram:CityName>
          <ram:CountryID>${escapeXml(invoice.buyer.country)}</ram:CountryID>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeDelivery/>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${invoice.currency}</ram:InvoiceCurrencyCode>
      <ram:ApplicableTradeTax>
        <ram:CalculatedAmount>${formatAmount(invoice.totalTVA)}</ram:CalculatedAmount>
        <ram:TypeCode>VAT</ram:TypeCode>
        <ram:BasisAmount>${formatAmount(invoice.totalHT)}</ram:BasisAmount>
        <ram:CategoryCode>S</ram:CategoryCode>
        <ram:RateApplicablePercent>${invoice.lines[0]?.taxRate || 18}</ram:RateApplicablePercent>
      </ram:ApplicableTradeTax>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${formatAmount(invoice.totalHT)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${formatAmount(invoice.totalHT)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${invoice.currency}">${formatAmount(invoice.totalTVA)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${formatAmount(invoice.totalTTC)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${formatAmount(invoice.totalTTC)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
    ${lines}
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`
}

// ────────── PEPPOL BIS 3.0 ──────────

export function generatePEPPOLBIS3(invoice: Invoice): string {
  // PEPPOL BIS 3.0 is based on UBL 2.1 with additional constraints
  // The main difference is the CustomizationID and ProfileID
  const baseUBL = generateUBL21(invoice)
  return baseUBL
    .replace(
      '<cbc:CustomizationID>urn:cen.eu:en16931:2017</cbc:CustomizationID>',
      '<cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>\n  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>'
    )
}

// ────────── Download helper ──────────

export function downloadXml(xml: string, filename: string): void {
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
