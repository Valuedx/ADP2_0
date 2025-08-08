// Examples.tsx
import invoiceImg from "../../Images/invoice.png";
import labReportImg from "../../Images/lab_report.png";
import loanFormImg from "../../Images/loan_form.png";
import chartImg from "../../Images/chart.png";
import GSTHindiInvoice from "../../Images/GST_Invoice_Hindi.jpg";
import GSTHindiInvoiceHandWritten from "../../Images/GST_invoice_hindi_handwritten.png";
import GSTEnglishInvoiceHandWritten from "../../Images/english_handwritten.jpg";
import EnglishInvoice from "../../Images/Invoice_english.jpg";
import BankCheck from "../../Images/BankCheck.jpg";
import DeathCertificate from "../../Images/DeathCertificateDMK.jpg";
import DischargeSummary from "../../Images/DischargeSummary.jpg";
import DischargeSummaryHandwritten from "../../Images/DischargeSummary_handwritten.jpg";

export type Example = {
  id: number;
  title: string;
  src: string;
  data: Record<string, unknown>;
};

export const examples: Example[] = [
  {
    id: 1,
    title: "Invoice",
    src: invoiceImg,
    data: {
      documentType: "Invoice",
      invoiceNumber: "US-001",
      invoiceDate: "11/02/2019",
      dueDate: "26/02/2019",
      buyer: {
        name: "John Smith",
        address: "2 Court Square\nNew York, NY 12210",
      },
      shipTo: {
        name: "John Smith",
        address: "3787 Pineview Drive\nCambridge, MA 12210",
      },
      seller: {
        name: "East Repair Inc.",
        address: "1912 Harvest Lane\nNew York, NY 12210",
      },
      lineItems: [
        {
          description: "Front and rear brake cables",
          quantity: "1",
          unitPrice: "100.00",
          amount: "100.00",
        },
        {
          description: "New set of pedal arms",
          quantity: "2",
          unitPrice: "15.00",
          amount: "30.00",
        },
        {
          description: "Labor 3hrs",
          quantity: "3",
          unitPrice: "5.00",
          amount: "15.00",
        },
      ],
      subtotal: "145.00",
      salesTax: "9.06",
      total: "154.06",
      termsAndConditions:
        "Payment is due within 15 days\nPlease make checks payable to: East Repair Inc.",
    },
  },
  {
    id: 2,
    title: "Lab Report",
    src: labReportImg,
    data: {
      documentType: "Medical Lab Report",
      patientInfo: {
        name: "Yash M. Patel",
        age: "21 Years",
        gender: "Male",
        id: "555",
      },
      sampleDetails: {
        referredBy: "Dr. Hiren Shah",
        sampleCollectedAt: "125, Shivam Bungalow, SG Road, Mumbai",
      },
      contactInfo: {
        email: "drlogypathlab@drlogy.com",
        website: "www.drlogy.com",
        phone: "0123456789",
      },
      testResults: [
        {
          parameter: "MCH",
          result: "27.2",
          unit: "pg",
          referenceRange: "27-32"
        },
        {
          parameter: "RDW",
          result: "13.6",
          unit: "%",
          referenceRange: "11.6-14.0"
        },
        {
          parameter: "MCHC",
          result: "32.8",
          unit: "g/dL",
          referenceRange: "32.5-34.5"
        },
        {
          parameter: "Basophils",
          result: "1",
          unit: "%",
          referenceRange: "00-02"
        },
        {
          parameter: "Monocytes",
          result: "7",
          unit: "%",
          referenceRange: "00-10"
        },
        {
          parameter: "Hemoglobin",
          result: "12.5",
          unit: "g/dL",
          referenceRange: "13.0-17.0"
        },
        {
          parameter: "Eosinophils",
          result: "1",
          unit: "%",
          referenceRange: "00-06"
        },
        {
          parameter: "Lymphocytes",
          result: "31",
          unit: "%",
          referenceRange: "20-40"
        },
        {
          parameter: "Neutrophils",
          result: "60",
          unit: "%",
          referenceRange: "50-62"
        },
        {
          parameter: "Platelet Count",
          result: "150000",
          unit: "cumm",
          referenceRange: "150000-410000"
        },
        {
          parameter: "Total RBC Count",
          result: "5.2",
          unit: "mill/cumm",
          referenceRange: "4.5-5.5"
        },
        {
          parameter: "Total WBC Count",
          result: "9000",
          unit: "cumm",
          referenceRange: "4000-11000"
        },
        {
          parameter: "Packed Cell Volume",
          result: "57.5",
          unit: "%",
          referenceRange: "40-50"
        },
        {
          parameter: "Mean Corpuscular Volume",
          result: "87.75",
          unit: "fL",
          referenceRange: "83-101"
        }
      ]
    },
  },

  {
    id: 3,
    title: "Loan Form",
    src: loanFormImg,
    data: {
      documentType: "Loan Estimate",
      metadata: {
        loanId: "123456789",
        product: "Fixed Rate",
        purpose: "Purchase",
        loanTerm: "30 years",
        loanType: "Conventional",
        rateLock: "NO YES, until 4/16/2013 at 5:00 p.m. EDT Before closing, your interest rate, points, and lender credits can change unless you lock the interest rate. All other estimated closing costs expire on 3/4/2013 at 5:00p.m. EDT",
        dateIssued: "2/15/2013"
      },
      totals: {
        salePrice: "$180,000",
        estimatedClosingCosts: "$8,054 Includes $5,672 in Loan Costs + $2,382 in Other Costs - $0 in Lender Credits. See page 2 for details.",
        estimatedCashToClose: "$16,054 Includes Closing Costs. See Calculating Cash to Close on page 2 for details."
      },
      other: {
        escrowPropertyTaxes: "YES",
        escrowHomeownersInsurance: "YES",
        escrowOther: "See Section G on page 2 for escrowed property costs. You must pay for other property costs separately."
      },
      lineItems: [
        {
          loanAmount: "$162,000",
          canIncreaseAfterClosing: "NO"
        },
        {
          interestRate: "3.875%",
          canIncreaseAfterClosing: "NO"
        },
        {
          monthlyPrincipalInterest: "$761.78",
          canIncreaseAfterClosing: "NO"
        },
        {
          prepaymentPenalty: "YES As high as $3,240 if you pay off the loan during the first 2 years"
        },
        {
          balloonPayment: "NO"
        },
        {
          principalInterestYears1to7: "$761.78",
          principalInterestYears8to30: "$761.78"
        },
        {
          mortgageInsuranceYears1to7: "82"
        },
        {
          estimatedEscrowYears1to7: "206",
          estimatedEscrowYears8to30: "206"
        },
        {
          estimatedTotalMonthlyPaymentYears1to7: "$1,050",
          estimatedTotalMonthlyPaymentYears8to30: "$968"
        },
        {
          estimatedTaxesInsuranceAssessments: "$206 a month"
        }
      ],
      partyDetails: {
        property: "456 Somewhere Avenue Anytown, ST 12345",
        applicants: "Michael Jones and Mary Stone 123 Anywhere Street Anytown, ST 12345"
      }
    }
  },

  {
    id: 4,
    title: "Performance Charts",
    src: chartImg,
    data: {
      documentType: "Monthly Budget Report",
      table: [
        { Month: "Jan", Actual: "4500", Budget: "5000", Variance: "-500" },
        { Month: "Feb", Actual: "5600", Budget: "4800", Variance: "800" },
        { Month: "Mar", Actual: "6200", Budget: "6000", Variance: "200" },
        { Month: "Apr", Actual: "5215", Budget: "5500", Variance: "-285" },
        { Month: "May", Actual: "6250", Budget: "5800", Variance: "450" },
        { Month: "Jun", Actual: "5900", Budget: "6500", Variance: "-600" },
        { Month: "Jul", Actual: "5825", Budget: "6000", Variance: "-175" },
        { Month: "Aug", Actual: "7680", Budget: "7000", Variance: "680" },
        { Month: "Sep", Actual: "6050", Budget: "6500", Variance: "-450" },
        { Month: "Oct", Actual: "6325", Budget: "6000", Variance: "325" },
        { Month: "Nov", Actual: "6100", Budget: "5900", Variance: "200" },
        { Month: "Dec", Actual: "5200", Budget: "5500", Variance: "-300" }
      ]
    }
  },
  {
    id: 5,
    title: "GST Invoice Hindi",
    src: GSTHindiInvoice,
    data: {
      documentType: "GST Invoice Hindi",
      billingDetails: {
        "POS": "महाराष्ट्र",
        "CGST": "₹ 12,996.00",
        "IGST": null,
        "SGST": "₹ 12,996.00",
        "due_date": "1/11/2022",
        "due_days": "15",
        "GST_number": "22-BBBBB1234A-1-Z-6",
        "line_items": [
          {
            "HSN": "84713010",
            "rate": "₹25,000",
            "amount": "₹59,000",
            "quantity": "2",
            "product_id": "पीबीटी 001",
            "item_number": "1",
            "taxable_value": "₹50,000",
            "GST_percentage": "18%",
            "product_description": "डेल इंस्पिरॉन 1050"
          },
          {
            "HSN": "84713010",
            "rate": "₹ 28,000",
            "amount": "₹66,080",
            "quantity": "2",
            "product_id": "पीबीटी 002",
            "item_number": "2",
            "taxable_value": "₹56,000",
            "GST_percentage": "18%",
            "product_description": "लेनोवो 5125-1"
          },
          {
            "HSN": "847330",
            "rate": "₹1,200",
            "amount": "₹2.832",
            "quantity": "2",
            "product_id": "पीबीटी 004",
            "item_number": "3",
            "taxable_value": "₹2,400",
            "GST_percentage": "18%",
            "product_description": "लॉजिटेक माउस वायरलेस"
          },
          {
            "HSN": "847330",
            "rate": "₹2,500",
            "amount": "₹5,900",
            "quantity": "2",
            "product_id": "पीबीटी 005",
            "item_number": "4",
            "taxable_value": "₹ 5,000",
            "GST_percentage": "18%",
            "product_description": "लॉजिटेक कीबोर्ड"
          },
          {
            "HSN": "847330",
            "rate": "₹2,300",
            "amount": "₹5,428",
            "quantity": "2",
            "product_id": "पीबीटी 014",
            "item_number": "5",
            "taxable_value": "₹4,600",
            "GST_percentage": "18%",
            "product_description": "ज़ेब्रोनिक्स कीबोर्ड"
          },
          {
            "HSN": "847330",
            "rate": "₹500",
            "amount": "1,180",
            "quantity": "2",
            "product_id": "पीबीटी 003",
            "item_number": "6",
            "taxable_value": "₹1,000",
            "GST_percentage": "18%",
            "product_description": "लॉजिटेक माउस"
          },
          {
            "HSN": "847330",
            "rate": "2,800",
            "amount": "₹6,608",
            "quantity": "2",
            "product_id": "पीबीटी 015",
            "item_number": "7",
            "taxable_value": "₹5,600",
            "GST_percentage": "18%",
            "product_description": "ज़ेब्रोनिक्स कीबोर्ड वायरलेस"
          },
          {
            "HSN": "84733099",
            "rate": "₹ 8,000",
            "amount": "₹ 18,880",
            "quantity": "2",
            "product_id": "पीबीटी 011",
            "item_number": "8",
            "taxable_value": "₹ 16,000",
            "GST_percentage": "18%",
            "product_description": "डेल मॉनिटर 5684"
          },
          {
            "HSN": "847330",
            "rate": "₹1,800",
            "amount": "₹4,248",
            "quantity": "2",
            "product_id": "पीबीटी012",
            "item_number": "9",
            "taxable_value": "₹3,600",
            "GST_percentage": "18%",
            "product_description": "ज़ेब्रोनिक्स माउस"
          },
          {
            "HSN": "847330",
            "rate": "₹100",
            "amount": "₹236",
            "quantity": "2",
            "product_id": "पीबीटी 009",
            "item_number": "10",
            "taxable_value": "₹ 200",
            "GST_percentage": "18%",
            "product_description": "माउस पैड"
          }
        ],
        "customer_id": "सीबीटी 001",
        "vendor_name": "उज्ज्वल ट्रेडर",
        "invoice_date": "12/27/2021",
        "invoice_kind": "Credit",
        "invoice_type": "Tax Invoice",
        "customer_name": "डामर कंप्यूटर",
        "invoice_total": "*170,392.00",
        "invoice_number": "1",
        "taxable_amount": "₹ 144,400.00",
        "total_quantity": "20",
        "vendor_address": "123, एबीसी बिल्डिंग, डीईएफ स्ट्रीट, जीएचआई",
        "vendor_location": "महाराष्ट्र",
        "customer_address": "एबीसी, डेफ स्ट्रीट 1",
        "vendor_GST_number": "22-AAAAA0000A-1-Z-5"
      }
    }
  }, {
    id: 6,
    title: "GST Invoice Hindi Handwritten",
    src: GSTHindiInvoiceHandWritten,
    data: {
      documentType: "GST Invoice Hindi Handwritten",
      billingDetails: {
        "total": "<200",
        "advance": null,
        "balance": null,
        "subtotal": null,
        "line_items": [
          {
            "amount": "9,000",
            "quantity": null,
            "unit_price": null,
            "item_description": "पानी टांक धुलाई २५/६/"
          },
          {
            "amount": "9,600",
            "quantity": null,
            "unit_price": null,
            "item_description": "पस्प हाऊस एअर वाटा खाद‌काम व इलस्ती"
          },
          {
            "amount": "2,000",
            "quantity": null,
            "unit_price": null,
            "item_description": "फागुन टोकावर तलाव C. जाईन्ड जिकडे करती"
          },
          {
            "amount": "9000",
            "quantity": null,
            "unit_price": null,
            "item_description": "प्रकाश अग्रवाल दुकाना अब"
          },
          {
            "amount": "१०००",
            "quantity": null,
            "unit_price": null,
            "item_description": "पाणी टाकी धुनप (६/16)"
          },
          {
            "amount": "9,५००",
            "quantity": null,
            "unit_price": null,
            "item_description": "सामरम नगदी"
          }
        ],
        "seller_name": "प्रा. नळ व पाईप फिटिंग पलम्बर",
        "invoice_date": null,
        "seller_phone": "9823844933",
        "customer_name": "ग्रामपंचायत कार्यालय",
        "invoice_number": "42",
        "seller_address": "मु.पो. परसवाडा ता. तिरोडा जि. गाँदिवा",
        "total_in_words": "आठ हजार दोनशे रुपये",
        "customer_address": "अर्जुनी"
      }
    }
  }, {
    id: 7,
    title: "GST Invoice English Handwritten",
    src: GSTEnglishInvoiceHandWritten,
    data: {
      documentType: "GST Invoice English Handwritten",
      billingDetails: {
        "items": [
          {
            "unit": "PC.",
            "amount": "50.00",
            "quantity": "1",
            "unit_price": "50.00",
            "description": "baby roller 4\" cutton"
          },
          {
            "unit": "gals.",
            "amount": "3,000.00",
            "quantity": "5",
            "unit_price": "600-",
            "description": "Rigid clast. (Paint (white)"
          },
          {
            "unit": "U",
            "amount": "600.00",
            "quantity": "1",
            "unit_price": "600-",
            "description": "BSJ Sanding Sealer"
          },
          {
            "unit": "b",
            "amount": "630.00",
            "quantity": "1",
            "unit_price": "630-",
            "description": "Clear gloss laeq."
          },
          {
            "unit": "5",
            "amount": "485.00",
            "quantity": "1",
            "unit_price": "485-",
            "description": "lacq. Thunner"
          },
          {
            "unit": "liter",
            "amount": "200.00",
            "quantity": "1",
            "unit_price": "200-",
            "description": "dead flat lacy."
          },
          {
            "unit": "b",
            "amount": "250.00",
            "quantity": "1",
            "unit_price": "250-",
            "description": "auto lacy. White"
          },
          {
            "unit": "PCS.",
            "amount": "100.00",
            "quantity": "2",
            "unit_price": "50-",
            "description": "Paint brush. 2\""
          },
          {
            "unit": "Kilo",
            "amount": "75.00",
            "quantity": "1",
            "unit_price": "75-",
            "description": "Cotton Waste"
          },
          {
            "unit": "yds. 3m. S. Paper",
            "amount": "430.00",
            "quantity": "2",
            "unit_price": "215-",
            "description": "* 100 Total Sales (VAT Inclusive)"
          },
          {
            "unit": "Pcs. w/p. S.",
            "amount": "75.00",
            "quantity": "5",
            "unit_price": "15-",
            "description": "150 Less:VAT"
          }
        ],
        "address": "Malanday Marikina",
        "sold_to": "Sitth. C",
        "amount_due": "5.263.39",
        "vat_amount": "631.61",
        "invoice_date": "Mar. 14/2018",
        "invoice_number": "11473",
        "total_amount_due": "5,895.00"
      }
    }
  },
  {
    id: 8,
    title: "GST Invoice English",
    src: EnglishInvoice,
    data: {
      documentType: "GST Invoice Handwritten",
      billingDetails: [
        {
          "field": "Business / Company Name",
          "value": null
        },
        {
          "field": "BUSINESS INVOICE",
          "value": null
        },
        {
          "field": "DATE:",
          "value": null
        },
        {
          "field": "INVOICE#:",
          "value": null
        },
        {
          "field": "Client #",
          "value": null
        },
        {
          "field": "BILL TO",
          "value": null
        },
        {
          "field": "Name",
          "value": null
        },
        {
          "field": "Address",
          "value": null
        },
        {
          "field": "City, State ZIP",
          "value": null
        },
        {
          "field": "Country",
          "value": null
        },
        {
          "field": "Phone",
          "value": null
        },
        {
          "field": "Email",
          "value": null
        },
        {
          "field": "SHIP TO",
          "value": null
        },
        {
          "field": "Name",
          "value": null
        },
        {
          "field": "Address",
          "value": null
        },
        {
          "field": "City, State ZIP",
          "value": null
        },
        {
          "field": "Country",
          "value": null
        },
        {
          "field": "Contact",
          "value": null
        },
        {
          "field": "P.O. #",
          "value": null
        },
        {
          "field": "Sales Rep. Name",
          "value": null
        },
        {
          "field": "Ship Date",
          "value": null
        },
        {
          "field": "Ship Via",
          "value": null
        },
        {
          "field": "Terms",
          "value": null
        },
        {
          "field": "Due Date",
          "value": null
        },
        {
          "field": "p006 Description",
          "value": "Business invoicing sample-item 6"
        },
        {
          "field": "p006 Quantity",
          "value": "6"
        },
        {
          "field": "p006 Unit Price",
          "value": "60.00"
        },
        {
          "field": "p006 Line Total",
          "value": "360.00"
        },
        {
          "field": "p007 Description",
          "value": "Business invoicing sample-item 7"
        },
        {
          "field": "p007 Quantity",
          "value": "7"
        },
        {
          "field": "p007 Unit Price",
          "value": "70.00"
        },
        {
          "field": "p007 Line Total",
          "value": "490.00"
        },
        {
          "field": "p1008 Description",
          "value": "Business invoicing sample-item S"
        },
        {
          "field": "p1008 Quantity",
          "value": "S"
        },
        {
          "field": "p1008 Unit Price",
          "value": "80.00"
        },
        {
          "field": "p1008 Line Total",
          "value": "640.00"
        },
        {
          "field": "p1009 Description",
          "value": "Business invoicing sample-item 9"
        },
        {
          "field": "p1009 Quantity",
          "value": "9"
        },
        {
          "field": "p1009 Unit Price",
          "value": "90.00"
        },
        {
          "field": "p1009 Line Total",
          "value": "S10.00"
        },
        {
          "field": "p1010 Description",
          "value": "Business invoicing sample-item 10"
        },
        {
          "field": "p1010 Quantity",
          "value": "10"
        },
        {
          "field": "p1010 Unit Price",
          "value": "100.00"
        },
        {
          "field": "p1010 Line Total",
          "value": "1,000.00"
        },
        {
          "field": "SUBTOTAL",
          "value": "3,300.00"
        },
        {
          "field": "TAX",
          "value": "66.00"
        },
        {
          "field": "SHIPPING & HANDLING",
          "value": null
        },
        {
          "field": "TOTAL",
          "value": "3,360.00"
        },
        {
          "field": "PAID",
          "value": null
        },
        {
          "field": "TOTAL DUE",
          "value": "3,360.00"
        },
        {
          "field": "Total Due in English Words",
          "value": "Tluee Thousand Three Hundred Sixty Eight Dollars and No Cents"
        }
      ]
    }
  },
  {
    id: 9,
    title: "Bank Check",
    src: BankCheck,
    data: {
            documentType: "Bank Check",
            "page_1": {
              "notes": {
                "bearer_status": "Or Bearer",
                "payment_terms": "Payable at par at all TJSB branches"
              },
              "parties": {
                "bank": {
                  "name": "TJSB SAHAKARI BANK LTD.",
                  "type": "MULTI-STATE SCHEDULED BANK",
                  "address": "Plot No. 119, Opp. to Jaihind School, Jamtani Chowk, Pimpri, Pune 411017"
                },
                "payee": {
                  "name": "BVG India LTD."
                },
                "drawer": {
                  "name": "BRAMHAGIRI I WING MHADA SAH GRUHNIRMAN SANSTHA",
                  "signature_title": "Chairman / Secretary / Treasurer"
                }
              },
              "metadata": {
                "currency": "INR",
                "check_number": "270262",
                "date_of_issue": "2025-06-08",
                "serial_number_top_left": "988250",
                "validity_period_months": 3
              },
              "page_info": "page 1/1",
              "bank_details": {
                "ifsc_code": "TJSB0000035",
                "micr_line": {
                  "bank_code": "411109006",
                  "transaction_code": "10",
                  "account_type_code": "000012",
                  "check_serial_number": "270262"
                },
                "account_number": "03511020000012",
                "internal_ac_no": "150005"
              },
              "financial_summary": {
                "amount_in_words": "Thirty Eight Thousand Three hundred fifteen Only",
                "amount_in_figures": 38315
              }
            }
          }
  },
  {
    id: 10,
    title: "Death Certificate",
    src: DeathCertificate,
    data: {
            documentType: "Death Certificate",
            "page_1": {
              "notes": {
                "remarks": "---",
                "updated_on": "14-02-2024 00:00:00",
                "disclaimers": [
                  "THIS IS A COMPUTER GENERATED CERTIFICATE WHICH CONTAINS FACSIMILE SIGNATURE OF THE ISSUING AUTHORITY",
                  "THE GOVT. OF INDIA VIDE CIRCULAR NO. 1/12/2014-VS(CRS) DATED 27-JULY-2015 HAS APPROVED THIS CERTIFICATE AS A VALID LEGAL DOUCMENT FOR ALL OFFICIAL PURPOSES.",
                  "ENSURE REGISTRATION OF EVERY BIRTH AND DEATH"
                ],
                "date_of_death": "12-01-2024",
                "date_of_issue": "14-02-2024",
                "place_of_death": {
                  "english": "DR D.Y. PATIL. HOSPITAL PIMPRI",
                  "marathi": "डॉ. डी. वाय. पाटील हॉस्पिटल पिंपरी"
                },
                "registration_no": "D-2024: 27-90328-000520",
                "issuing_authority": {
                  "role": {
                    "english": "SUB-REGISTRAR (BIRTH & DEATH)",
                    "marathi": "उप-रजिस्ट्रार (जन्म व मृत्यु)"
                  },
                  "organization": "MUNICIPAL CORPORATION PIMPRI CHINCHWAD WARD 39"
                },
                "date_of_registration": "14-02-2024",
                "date_of_death_full_text": "TWELFTH-JANUARY-TWO THOUSAND TWENTY FOUR"
              },
              "parties": {
                "deceased": {
                  "age": "83 YEARS",
                  "sex": {
                    "english": "MALE",
                    "marathi": "पुरुष"
                  },
                  "name": {
                    "english": "DATTATRAY MARUTI KUTE",
                    "marathi": "दत्तात्रय मारुती कुटे"
                  },
                  "father": {
                    "name": {
                      "english": "MARUTI BABURAO KUTE",
                      "marathi": "मारुती बाबुराव कुटे"
                    },
                    "aadhaar_no": null
                  },
                  "mother": {
                    "name": {
                      "english": "PARVATI MARUTI KUTE",
                      "marathi": "पार्वती मारुती कुटे"
                    },
                    "aadhaar_no": null
                  },
                  "spouse": {
                    "name": {
                      "english": "SUSHILA DATTATRAY KUTE",
                      "marathi": "सुशिला दत्तात्रय कुटे"
                    },
                    "aadhaar_no": null
                  },
                  "aadhaar_no": "XXXXXXXX6041",
                  "permanent_address": {
                    "english": "1-1802, MHADA TOWERS, PIMPRIGAON, PIMPRI CHINCHWAD, HAVELI, PUNE, MAHARASHTRA",
                    "marathi": "१-१८०२, म्हाडा टॉवर्स, पिंपरीगांव, पिंपरी चिंचवड, हवेली, पुणे, महाराष्ट्र"
                  },
                  "address_at_time_of_death": {
                    "english": "1-1802, MHADA TOWERS, PIMPRIGAON, PIMPRI CHINCHWAD, HAVELI, PUNE, MAHARASHTRA",
                    "marathi": "१-१८०२, म्हाडा टॉवर्स, पिंपरीगांव, पिंपरी चिंचवड, हवेली, पुणे, महाराष्ट्र"
                  }
                }
              },
              "metadata": {
                "form_number": "FORM-6",
                "document_type": "DEATH CERTIFICATE",
                "issuing_statement": "ISSUED UNDER SECTION 12/17 OF THE REGISTRATION OF BIRTHS & DEATHS ACT, 1969 AND RULE 8/13 OF THE MAHARASHTRA REGISTRATION OF BIRTHS & DEATHS RULES 2000.",
                "certificate_number": "No. 1",
                "issuing_department": "DEPARTMENT OF HEALTH",
                "issuing_government": "GOVERNMENT OF MAHARASHTRA",
                "issuing_municipality": "MUNICIPAL CORPORATION PIMPRI CHINCHWAD WARD 39",
                "certification_statement": "THIS IS TO CERTIFY THAT THE FOLLOWING INFORMATION HAS BEEN TAKEN FROM THE ORIGINAL RECORD OF DEATH WHICH IS THE REGISTER FOR MUNICIPAL CORPORATION PIMPRI CHINCHWAD WARD 39 OF TAHSIL/BLOCK HAVELI OF DISTRICT PUNE OF STATE/UNION TERRITORY MAHARASHTRA, INDIA."
              },
              "page_info": "page 1/1",
              "line_items": [],
              "financial_summary": null
            }
          }
  },
  {
    id: 11,
    title: "Discharge Summary",
    src: DischargeSummary,
    data: {
            documentType: "Discharge Summary",
            "page_1": {
              "dates": {
                "admission_date": "11/07/2017",
                "discharge_date": "11/07/2017",
                "operation_date": "11/07/2017"
              },
              "notes": {
                "follow_up": ""
              },
              "parties": {
                "hospital": {
                  "name": "SHREE BIDADA SARVODAYA TRUST MUMBAI",
                  "address": "286-B, Dr. Ambedkar Road, Parel, Mumbai - 400 012.",
                  "eye_hospital": "SMT. ZAVERBEN DAMJI PATRAMAL PARIVAR RAIPURWALA (KAPAYA) EYE HOSPITAL",
                  "sanchalit_by": "MATUSHRI RATANBEN PALAN MANEK",
                  "hospital_name": "MARU HOSPITAL & RESEARCH CENTRE"
                }
              },
              "metadata": {
                "document_type": "Discharge Summary",
                "telephone_numbers": [
                  "3934 7272",
                  "2471 7272",
                  "2471 7474"
                ],
                "registration_number": "E-13282 (Mumbai)"
              },
              "page_info": "page 1/1",
              "patient_details": {
                "age": "75",
                "sex": "M",
                "name": "Dattatray M. Kute",
                "r_no": "R-2008035",
                "opd_no": "S-1037721",
                "diagnosis": "LE Cat"
              }
            }
          }
  },
  {
    id: 12,
    title: "Discharge Handwritten",
    src: DischargeSummaryHandwritten,
    data: {
            documentType: "Discharge Summary Handwritten",
            "page_1": {
              "notes": "Surgeon's Signature present but not extractable as text.",
              "parties": {
                "operating_surgeon": [
                  "Dr. B. Gala",
                  "Dr. M. Shah"
                ]
              },
              "metadata": {},
              "diagnosis": "LE cat",
              "follow_up": "8 am",
              "operation": "LE cat + IOL IA (Phacofoldable)",
              "page_info": "page 1/1",
              "iol_specifications": {
                "Exp": "2019-09",
                "Lot": "16-1380",
                "REF": "601",
                "S/N": "AH16091669 002",
                "OPTIC": "6.00 mm",
                "POWER": "19.00 D",
                "LENGTH": "12.50 mm",
                "A_Const": "118.00",
                "Manufactured_Date": "2016-10",
                "Manufacturer_Type": "ACRYFOLD"
              },
              "treatment_on_discharge": {
                "header": "Rx Treatment on Discharge",
                "eye_drops": [
                  {
                    "name": "Ap-drop PD / Dm Eye drop",
                    "frequency": "4 times a day"
                  },
                  {
                    "name": "Nepallam / Nepalact Eye drop",
                    "frequency": "3 times a day"
                  },
                  {
                    "name": "Soft drop / Softvise Eye drop",
                    "frequency": "3 times a day"
                  }
                ],
                "medications": [
                  {
                    "name": "Zetax ODT / Zoxan",
                    "type": "Tablet",
                    "dosage": "500mg",
                    "duration": "5 days",
                    "frequency": "1 tablet once a day"
                  },
                  {
                    "name": "Flexon / Rutcheal-D",
                    "type": "Tablet",
                    "dosage": "1-1 (twice daily)",
                    "duration": "5 days"
                  }
                ],
                "instructions": [
                  "Dark Glass (wear dark glasses)"
                ]
              }
            }
          }
  },

];