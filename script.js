// Variáveis globais
let currentScreen = 'loginScreen';
let productsInCurrentOrder = [];
let userRole = 'guest';
let simulatedSupplierOrders = {};
let simulatedColombiaOrder = null;
let currentOrderDetails = null;
let currentUserClientName = "Cliente Mexico"; // Updated default client name
let nextParentRequestCounter = 1;
let nextPurchaseOrderIdCounter = 0;
let nextSapOrderIdCounter = 1;
let currentParentOrderId = null;
let currentViewingPO = null;
let currentPurchasingPO = null;

const MAX_CUBAGE_20HC = 37.4;
const MAX_CUBAGE_40HC = 76.0;

const productDatabase = {
    "PROD001": { code: "PROD001", clientCode: "SKU-001", description: "Smartphone Premium X1", moq: 3, unitPrice: 150.00, tableValue: 160.00, cubageUnit: 0.005, simulatedStock: 100, productLine: "Eletrônicos", supplier: "Fornecedor A", originCountry: "Hong Kong" },
    "PROD002": { code: "PROD002", clientCode: "SKU-002", description: "Tablet Pro Z", moq: 2, unitPrice: 250.00, tableValue: 265.00, cubageUnit: 0.008, simulatedStock: 50, productLine: "Eletrônicos", supplier: "Fornecedor B", originCountry: "Hong Kong" },
    "PROD003": { code: "PROD003", clientCode: "SKU-003", description: "Fone Bluetooth Max", moq: 5, unitPrice: 45.00, tableValue: 50.00, cubageUnit: 0.001, simulatedStock: 200, productLine: "Acessórios", supplier: "Fornecedor C", originCountry: "Colômbia" },
    "PROD004": { code: "PROD004", clientCode: "SKU-004", description: "Smartwatch Sport Y", moq: 1, unitPrice: 80.00, tableValue: 85.00, cubageUnit: 0.002, simulatedStock: 120, productLine: "Vestíveis", supplier: "Fornecedor A", originCountry: "Hong Kong" },
    "PROD005": { code: "PROD005", clientCode: "SKU-005", description: "Câmera Digital Ultra HD", moq: 2, unitPrice: 300.00, tableValue: 320.00, cubageUnit: 0.01, simulatedStock: 30, productLine: "Fotografia", supplier: "Fornecedor B", originCountry: "Hong Kong" },
    "PROD006": { code: "PROD006", clientCode: "SKU-006", description: "Bateria Portátil Mega", moq: 10, unitPrice: 25.00, tableValue: 28.00, cubageUnit: 0.0005, simulatedStock: 300, productLine: "Acessórios", supplier: "Fornecedor C", originCountry: "Colômbia" },
    "PROD007": { code: "PROD007", clientCode: "SKU-007", description: "Cadeira Ergonômica", moq: 1, unitPrice: 600.00, tableValue: 650.00, cubageUnit: 0.15, simulatedStock: 15, productLine: "Móveis de Escritório", supplier: "Fornecedor A", originCountry: "Hong Kong" },
    "PROD008": { code: "PROD008", clientCode: "SKU-008", description: "Impressora 3D Industrial", moq: 1, unitPrice: 800.00, tableValue: 850.00, cubageUnit: 0.8, simulatedStock: 0, productLine: "Maquinário", supplier: "Fornecedor B", originCountry: "Hong Kong" },
    "PROD009": { code: "PROD009", clientCode: "SKU-009", description: "Monitor Ultrawide", moq: 1, unitPrice: 350.00, tableValue: 350.00, cubageUnit: 0.05, simulatedStock: 50, productLine: "Periféricos", supplier: "Fornecedor C", originCountry: "Colômbia" },
    "PROD010": { code: "PROD010", clientCode: "SKU-010", description: "Teclado Mecânico", moq: 1, unitPrice: 80.00, tableValue: 80.00, cubageUnit: 0.01, simulatedStock: 75, productLine: "Periféricos", supplier: "Fornecedor A", originCountry: "Hong Kong" },
    "PROD011": { code: "PROD011", clientCode: "SKU-011", description: "Mouse Gamer", moq: 1, unitPrice: 40.00, tableValue: 40.00, cubageUnit: 0.001, simulatedStock: 150, productLine: "Periféricos", supplier: "Fornecedor B", originCountry: "Hong Kong" }
};

const universalClientCodeToProductCodeMap = {};
for (const prodCode in productDatabase) {
    const product = productDatabase[prodCode];
    if (product.clientCode) {
        universalClientCodeToProductCodeMap[product.clientCode.toUpperCase()] = prodCode;
    }
}

const supplierCodeMap = {};
const supplierNameMap = {};
let nextSupplierCode = 22;

// New client names
const clientNames = ["Cliente Mexico", "Cliente Chile", "Cliente Paraguai", "Cliente Colombia"];
let clientIndex = 0;

// Function to assign client names cyclically, avoiding "Cliente Colombia" for "Colômbia" origin
function assignClientName(originCountry) {
    let assignedClient = clientNames[clientIndex % clientNames.length];
    // Ensure "Cliente Colombia" is not assigned to "Colômbia" origin
    if (originCountry === 'Colômbia' && assignedClient === 'Cliente Colombia') {
        clientIndex++; // Skip "Cliente Colombia" for this origin
        assignedClient = clientNames[clientIndex % clientNames.length];
    }
    clientIndex++;
    return assignedClient;
}

const orders = [
    {
        orderId: 'PED-001', parentOrderId: 'SOL-001', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 1550.00, status: 'Pendente', requestDate: '2025-06-20', lastUpdateDate: '2025-06-20',
        supplier: 'Fornecedor A', products: [{ code: 'PROD001', description: 'Smartphone Premium X1', quantity: 10, unitPrice: 155.00, cubageUnit: 0.005 }]
    },
    {
        orderId: 'PED-002', parentOrderId: 'SOL-009', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia',
        totalValue: 1200.00, status: 'Pendente', requestDate: '2025-06-21', lastUpdateDate: '2025-06-21',
        supplier: 'Fornecedor B', products: [{ code: 'PROD007', description: 'Cadeira Ergonômica', quantity: 2, unitPrice: 600.00, cubageUnit: 0.15 }]
    },
    {
        orderId: 'PED-003', parentOrderId: 'SOL-002', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 300.00, status: 'Rejeitado', requestDate: '2025-06-18', lastUpdateDate: '2025-06-19',
        supplier: 'Fornecedor A', products: [{ code: 'PROD003', description: 'Fone Bluetooth Max', quantity: 5, unitPrice: 45.00, cubageUnit: 0.001 }, { code: 'PROD006', description: 'Bateria Portátil Mega', quantity: 5, unitPrice: 25.00, cubageUnit: 0.0005 }]
    },
    {
        orderId: 'PED-004', parentOrderId: 'SOL-010', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia',
        totalValue: 800.00, status: 'Entregue', requestDate: '2025-06-23', lastUpdateDate: '2025-06-23',
        supplier: 'Fornecedor C', products: [{ code: 'PROD008', description: 'Impressora 3D Industrial', quantity: 1, unitPrice: 800.00, cubageUnit: 0.8 }]
    },
    {
        orderId: 'PED-005', parentOrderId: 'SOL-003', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 454.00, status: 'Pendente', requestDate: '2025-06-24', lastUpdateDate: '2025-06-24',
        supplier: 'Fornecedor B', products: [{ code: 'PROD001', description: 'Smartphone Premium X1', quantity: 2, unitPrice: 152.00, cubageUnit: 0.005 }, { code: 'PROD003', description: 'Fone Bluetooth Max', quantity: 3, unitPrice: 46.00, cubageUnit: 0.001 }]
    },
    {
        orderId: 'PED-006', parentOrderId: 'SOL-003', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 120.00, status: 'Chegada no Porto de Destino (ATA)', requestDate: '2025-06-24', lastUpdateDate: '2025-06-25',
        supplier: 'Fornecedor A', products: [{ code: 'PROD004', description: 'Smartwatch Sport Y', quantity: 1, unitPrice: 80.00, cubageUnit: 0.002 }, { code: 'PROD006', description: 'Bateria Portátil Mega', quantity: 2, unitPrice: 20.00, cubageUnit: 0.0005 }]
    },
    {
        orderId: 'PED-007', parentOrderId: 'SOL-004', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia',
        totalValue: 1800.00, status: 'Em Conferência', requestDate: '2025-06-25', lastUpdateDate: '2025-06-25',
        supplier: 'Fornecedor C', products: [{ code: 'PROD007', description: 'Cadeira Ergonômica', quantity: 3, unitPrice: 600.00, cubageUnit: 0.15 }]
    },
    {
        orderId: 'PED-008', parentOrderId: 'SOL-011', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 700.00, status: 'Carga Pronta', requestDate: '2025-06-25', lastUpdateDate: '2025-06-25',
        supplier: 'Fornecedor B', products: [{ code: 'PROD009', description: 'Monitor Ultrawide', quantity: 2, unitPrice: 350.00, cubageUnit: 0.05 }]
    },
    {
        orderId: 'PED-009', parentOrderId: 'SOL-005', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 120.00, status: 'Aprovado', requestDate: '2025-06-26', lastUpdateDate: '2025-06-26',
        supplier: 'Fornecedor A', products: [{ code: 'PROD010', description: 'Teclado Mecânico', quantity: 1, unitPrice: 80.00, cubageUnit: 0.01 }, { code: 'PROD011', description: 'Mouse Gamer', quantity: 1, unitPrice: 40.00, cubageUnit: 0.001 }]
    },
    {
        orderId: 'PED-010', parentOrderId: 'SOL-005', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 960.00, status: 'Pendente', requestDate: '2025-06-26', lastUpdateDate: '2025-06-26',
        supplier: 'Fornecedor C', products: [{ code: 'PROD005', description: 'Câmera Digital Ultra HD', quantity: 3, unitPrice: 320.00, cubageUnit: 0.01 }]
    },
    {
        orderId: 'PED-011', parentOrderId: 'SOL-006', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 100.00, status: 'Cancelado', requestDate: '2025-06-27', lastUpdateDate: '2025-06-27',
        supplier: 'Fornecedor A', products: [{ code: 'PROD003', description: 'Fone Bluetooth Max', quantity: 2, unitPrice: 50.00, cubageUnit: 0.001 }]
    },
    {
        orderId: 'PED-012', parentOrderId: 'SOL-012', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia', // This client will not be "Cliente Colombia"
        totalValue: 800.00, status: 'Em Rota de Entrega', requestDate: '2025-06-27', lastUpdateDate: '2025-06-27',
        supplier: 'Fornecedor B', products: [{ code: 'PROD008', description: 'Impressora 3D Industrial', quantity: 1, unitPrice: 800.00, cubageUnit: 0.8 }]
    },
    {
        orderId: 'PED-013', parentOrderId: 'SOL-007', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia',
        totalValue: 1200.00, status: 'Pendente', requestDate: '2025-06-28', lastUpdateDate: '2025-06-28',
        supplier: 'Fornecedor C', products: [{ code: 'PROD007', description: 'Cadeira Ergonômica', quantity: 2, unitPrice: 600.00, cubageUnit: 0.15 }]
    },
    {
        orderId: 'PED-014', parentOrderId: 'SOL-013', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 160.00, status: 'Saída do Porto de Embarque (ATD)', requestDate: '2025-06-28', lastUpdateDate: '2025-06-28',
        supplier: 'Fornecedor A', products: [{ code: 'PROD001', description: 'Smartphone Premium X1', quantity: 1, unitPrice: 160.00, cubageUnit: 0.005 }]
    },
    {
        orderId: 'PED-015', parentOrderId: 'SOL-008', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 760.00, status: 'Pendente', requestDate: '2025-06-29', lastUpdateDate: '2025-06-29',
        supplier: 'Fornecedor A', products: [{ code: 'PROD001', description: 'Smartphone Premium X1', quantity: 5, unitPrice: 152.00, cubageUnit: 0.005 }]
    },
    {
        orderId: 'PED-016', parentOrderId: 'SOL-008', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 510.00, status: 'Pendente', requestDate: '2025-06-29', lastUpdateDate: '2025-06-29',
        supplier: 'Fornecedor B', products: [{ code: 'PROD002', description: 'Tablet Pro Z', quantity: 2, unitPrice: 255.00, cubageUnit: 0.008 }]
    },
    {
        orderId: 'PED-017', parentOrderId: 'SOL-014', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 840.00, status: 'Pendente', requestDate: '2025-06-30', lastUpdateDate: '2025-06-30',
        supplier: 'Fornecedor C', products: [{ code: 'PROD003', description: 'Fone Bluetooth Max', quantity: 20, unitPrice: 42.00, cubageUnit: 0.001 }]
    },
    {
        orderId: 'PED-018', parentOrderId: 'SOL-015', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 410.00, status: 'Pendente', requestDate: '2025-06-29', lastUpdateDate: '2025-06-29',
        supplier: 'Fornecedor A', products: [{ code: 'PROD004', description: 'Smartwatch Sport Y', quantity: 5, unitPrice: 82.00, cubageUnit: 0.002 }]
    },
    {
        orderId: 'PED-019', parentOrderId: 'SOL-016', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 310.00, status: 'Pendente', requestDate: '2025-06-30', lastUpdateDate: '2025-06-30',
        supplier: 'Fornecedor B', products: [{ code: 'PROD005', description: 'Câmera Digital Ultra HD', quantity: 1, unitPrice: 310.00, cubageUnit: 0.01 }]
    },
    {
        orderId: 'PED-020', parentOrderId: 'SOL-017', clientFlag: assignClientName('Hong Kong'), originCountry: 'Hong Kong',
        totalValue: 330.00, status: 'Pendente', requestDate: '2025-06-25', lastUpdateDate: '2025-06-25',
        supplier: 'Fornecedor A', products: [{ code: 'PROD006', description: 'Bateria Portátil Mega', quantity: 15, unitPrice: 22.00, cubageUnit: 0.0005 }]
    },
    {
        orderId: 'SAP-001', parentOrderId: 'SOL-018', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia', // This client will not be "Cliente Colombia"
        totalValue: 500.00, status: 'Em Separação', requestDate: '2025-07-01', lastUpdateDate: '2025-07-01',
        supplier: 'Fornecedor C', products: [{ code: 'PROD009', description: 'Monitor Ultrawide', quantity: 1, unitPrice: 350.00, cubageUnit: 0.05 }, { code: 'PROD003', description: 'Fone Bluetooth Max', quantity: 3, unitPrice: 50.00, cubageUnit: 0.001 }]
    }
];

const initialGeneratedPurchaseOrders = [
    {
        parentOrderId: 'SOL-001', id: 'PED-001', supplier: 'Fornecedor A', supplierCode: '22', date: '2025-06-20',
        products: [
            { code: 'PROD001', name: 'Smartphone Premium X1', quantity: 10, unitPrice: 150.00, currentInternalUnitPrice: 160.00, newSupplierUnitPrice: 155.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (10 * 155).toFixed(2), currentInternalPriceTotal: (10 * 160).toFixed(2), overallApprovalStatus: 'Pendente',
        totalCubage: (10 * 0.005).toFixed(2)
    },
    {
        parentOrderId: 'SOL-014', id: 'PED-017', supplier: 'Fornecedor C', supplierCode: '44', date: '2025-06-30',
        products: [
            { code: 'PROD003', name: 'Fone Bluetooth Max', quantity: 20, unitPrice: 40.00, currentInternalUnitPrice: 48.00, newSupplierUnitPrice: 42.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (20 * 42).toFixed(2), currentInternalPriceTotal: (20 * 48).toFixed(2), overallApprovalStatus: 'Pendente',
        totalCubage: (20 * 0.001).toFixed(2)
    },
    {
        parentOrderId: 'SOL-003', id: 'PED-005', supplier: 'Fornecedor B', supplierCode: '33', date: '2025-06-24',
        products: [
            { code: 'PROD001', name: 'Smartphone Premium X1', quantity: 2, unitPrice: 150.00, currentInternalUnitPrice: 158.00, newSupplierUnitPrice: 152.00, approvalStatus: 'Pendente' },
            { code: 'PROD003', name: 'Fone Bluetooth Max', quantity: 3, unitPrice: 45.00, currentInternalUnitPrice: 48.00, newSupplierUnitPrice: 46.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (2 * 152 + 3 * 46).toFixed(2), currentInternalPriceTotal: (2 * 158 + 3 * 48).toFixed(2), overallApprovalStatus: 'Negociado',
        totalCubage: (2 * 0.005 + 3 * 0.001).toFixed(2)
    },
    {
        parentOrderId: 'SOL-015', id: 'PED-018', supplier: 'Fornecedor A', supplierCode: '22', date: '2025-06-29',
        products: [
            { code: 'PROD004', name: 'Smartwatch Sport Y', quantity: 5, unitPrice: 80.00, currentInternalUnitPrice: 85.00, newSupplierUnitPrice: 82.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (5 * 82).toFixed(2), currentInternalPriceTotal: (5 * 85).toFixed(2), overallApprovalStatus: 'Negociado',
        totalCubage: (5 * 0.002).toFixed(2)
    },
    {
        parentOrderId: 'SOL-008', id: 'PED-015', supplier: 'Fornecedor A', supplierCode: '22', date: '2025-06-29',
        products: [
            { code: 'PROD001', name: 'Smartphone Premium X1', quantity: 5, unitPrice: 150.00, currentInternalUnitPrice: 158.00, newSupplierUnitPrice: 152.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (5 * 152).toFixed(2), currentInternalPriceTotal: (5 * 158).toFixed(2), overallApprovalStatus: 'Aguardando Aprovação',
        totalCubage: (5 * 0.005).toFixed(2)
    },
    {
        parentOrderId: 'SOL-008', id: 'PED-016', supplier: 'Fornecedor B', supplierCode: '33', date: '2025-06-29',
        products: [
            { code: 'PROD002', name: 'Tablet Pro Z', quantity: 2, unitPrice: 250.00, currentInternalUnitPrice: 260.00, newSupplierUnitPrice: 255.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (2 * 255).toFixed(2), currentInternalPriceTotal: (2 * 260).toFixed(2), overallApprovalStatus: 'Aguardando Aprovação',
        totalCubage: (2 * 0.008).toFixed(2)
    },
    {
        parentOrderId: 'SOL-016', id: 'PED-019', supplier: 'Fornecedor B', supplierCode: '33', date: '2025-06-30',
        products: [
            { code: 'PROD005', name: 'Câmera Digital Ultra HD', quantity: 1, unitPrice: 300.00, currentInternalUnitPrice: 320.00, newSupplierUnitPrice: 310.00, approvalStatus: 'Pendente' }
        ],
        newSupplierPriceTotal: (1 * 310).toFixed(2), currentInternalPriceTotal: (1 * 320).toFixed(2), overallApprovalStatus: 'Aguardando Aprovação',
        totalCubage: (1 * 0.01).toFixed(2)
    },
    {
        parentOrderId: 'SOL-020', id: 'PED-021', supplier: 'Fornecedor A', supplierCode: '22', date: '2025-07-01',
        products: [
            { code: 'PROD004', name: 'Smartwatch Sport Y', quantity: 3, unitPrice: 80.00, currentInternalUnitPrice: 85.00, newSupplierUnitPrice: 88.00, approvalStatus: 'Rejeitar' }
        ],
        newSupplierPriceTotal: (3 * 88).toFixed(2), currentInternalPriceTotal: (3 * 85).toFixed(2), overallApprovalStatus: 'Rejeitado',
        totalCubage: (3 * 0.002).toFixed(2)
    },
    {
        parentOrderId: 'SOL-005', id: 'PED-010', supplier: 'Fornecedor C', supplierCode: '44', date: '2025-06-26',
        products: [
            { code: 'PROD005', name: 'Câmera Digital Ultra HD', quantity: 3, unitPrice: 320.00, currentInternalUnitPrice: 335.00, newSupplierUnitPrice: 320.00, approvalStatus: 'Aprovado' }
        ],
        newSupplierPriceTotal: (3 * 320).toFixed(2), currentInternalPriceTotal: (3 * 335).toFixed(2), overallApprovalStatus: 'Aprovado',
        totalCubage: (3 * 0.01).toFixed(2)
    },
    {
        parentOrderId: 'SOL-009', id: 'PED-002', supplier: 'Fornecedor B', supplierCode: '33', date: '2025-06-21',
        products: [
            { code: 'PROD007', name: 'Cadeira Ergonômica', quantity: 2, unitPrice: 600.00, currentInternalUnitPrice: 630.00, newSupplierUnitPrice: 600.00, approvalStatus: 'Aprovado' }
        ],
        newSupplierPriceTotal: (2 * 600).toFixed(2), currentInternalPriceTotal: (2 * 630).toFixed(2), overallApprovalStatus: 'Aprovado',
        totalCubage: (2 * 0.15).toFixed(2)
    },
    {
        parentOrderId: 'SOL-017', id: 'PED-020', supplier: 'Fornecedor A', supplierCode: '22', date: '2025-06-25',
        products: [
            { code: 'PROD006', name: 'Bateria Portátil Mega', quantity: 15, unitPrice: 20.00, currentInternalUnitPrice: 28.00, newSupplierUnitPrice: 22.00, approvalStatus: 'Aprovado' }
        ],
        newSupplierPriceTotal: (15 * 22).toFixed(2), currentInternalPriceTotal: (15 * 28).toFixed(2), overallApprovalStatus: 'Finalizado',
        totalCubage: (15 * 0.0005).toFixed(2)
    },
];

let generatedPurchaseOrders = JSON.parse(JSON.stringify(initialGeneratedPurchaseOrders));

// Fluxos de rastreamento
const hongKongTrackingFlow = [
    { name: 'Pendente', class: 'pending', description: 'Pedido criado, aguardando Compras Internacionais iniciar o processo.' },
    { name: 'Em Negociação', class: 'negotiation', description: 'Pedido enviado ao fornecedor, aguardando negociação' },
    { name: 'Aguardando Aprovação', class: 'waiting-approval', description: 'Pedido recebido, Aguardando aprovação da Gerencia' },
    { name: 'Rejeitado', class: 'rejected', isFinal: true }, 
    { name: 'Cancelado', class: 'cancelled', isFinal: true },
    { name: 'Aprovado', class: 'approved', description: 'Pedido Aprovado (via retorno da Gerência)' },
    { name: 'Em Produção', class: 'production', description: 'Pedido Aprovado, em produção pelo fornecedor' },
    { name: 'Carga Pronta', class: 'ready-cargo', description: 'Mercadoria pronta para embarque' },
    { name: 'Saída do Porto de Embarque (ATD)', class: 'atd', description: 'Pedido embarcado' },
    { name: 'Documentação Pendente', class: 'pending-doc', description: 'Providenciando documentação de embarque (CI, PL, TELEX RELEASE, COO, Serial Numbers, conforme necessidade do cliente)' },
    { name: 'Documentação OK', class: 'doc-ok', description: 'Toda documentação de embarque ok, processo finalizado no DIMPEX' },
    { name: 'Chegada no Porto de Destino (ATA)', class: 'ata', isFinal: true },
    { name: 'Finalizado', class: 'finished', isFinal: true }
];

const colombiaTrackingFlow = [
    { name: 'Pendente', class: 'pending' },
    { name: 'Em Separação', class: 'separation' },
    { name: 'Em Conferência', class: 'conference' },
    { name: 'Em Rota de Entrega', class: 'in-transit' },
    { name: 'Entregue', class: 'delivered', isFinal: true },
    { name: 'Aprovado', class: 'approved' },
    { name: 'Rejeitado', class: 'rejected', isFinal: true },
    { name: 'Cancelado', class: 'cancelled', isFinal: true }
];

/**
 * Exibe uma tela específica da aplicação.
 * @param {string} screenId - O ID da tela a ser exibida.
 */
function showScreen(screenId) {
    document.querySelectorAll('.page').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;

    // Lógica específica para cada tela ao ser exibida
    if (screenId === 'newOrderFormScreen') {
        resetNewOrderForm();
    }

    // Gerencia a visibilidade do botão "Simular Renato"
    const simulateRenatoBtn = document.getElementById('simulateRenatoBtn');
    if (simulateRenatoBtn) {
        if (userRole === 'client') {
            simulateRenatoBtn.classList.add('hidden');
        } else {
            simulateRenatoBtn.classList.remove('hidden');
        }
    }
}

/**
 * Exibe uma mensagem modal para o usuário.
 * @param {string} title - Título da mensagem.
 * @param {string} content - Conteúdo da mensagem (pode conter HTML).
 * @param {string} type - Tipo da mensagem ('info', 'success', 'error', 'warning').
 * @param {function} onConfirm - Função de callback para o botão de confirmação.
 * @param {function} onCancel - Função de callback para o botão de cancelamento.
 */
function showMessage(title, content, type = 'info', onConfirm = null, onCancel = null) {
    const modal = document.getElementById('messageModal');
    document.getElementById('messageModalTitle').innerText = title;
    document.getElementById('messageModalContent').innerHTML = content;
    const confirmBtn = document.getElementById('messageModalConfirmBtn');
    const cancelBtn = document.getElementById('messageModalCancelBtn');
    const closeBtn = document.getElementById('messageModalCloseBtn');

    confirmBtn.onclick = () => { if (onConfirm) onConfirm(); modal.classList.remove('active'); };
    cancelBtn.onclick = () => { if (onCancel) onCancel(); modal.classList.remove('active'); };
    closeBtn.onclick = () => modal.classList.remove('active');

    confirmBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    closeBtn.classList.remove('hidden');

    if (onConfirm || onCancel) {
        closeBtn.classList.add('hidden');
        confirmBtn.classList.remove('hidden');
        if (onCancel) {
            cancelBtn.classList.remove('hidden');
        }
    }
    modal.classList.add('active');
}

/**
 * Exibe uma mensagem temporária para adição de produtos.
 * @param {string} message - A mensagem a ser exibida.
 * @param {string} type - O tipo da mensagem (e.g., 'success', 'error', 'warning', 'info').
 */
function displayAddProductMessage(message, type) {
    const messageDiv = document.getElementById('addProductMessage');
    
    messageDiv.innerText = message;
    messageDiv.className = `validation-message ${type}`; // Adiciona a classe de tipo para estilização
    messageDiv.style.display = 'block';
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000); // Esconde a mensagem após 3 segundos
}

/**
 * Obtém ou gera um código de fornecedor para um nome de fornecedor.
 * @param {string} supplierName - O nome do fornecedor.
 * @returns {string} O código do fornecedor.
 */
function getOrGenerateSupplierCode(supplierName) {
    if (!supplierCodeMap[supplierName]) {
        supplierCodeMap[supplierName] = String(nextSupplierCode);
        supplierNameMap[String(nextSupplierCode)] = supplierName;
        nextSupplierCode += 11; // Incrementa para o próximo código
    }
    return supplierCodeMap[supplierName];
}

/**
 * Obtém o nome do fornecedor a partir do código.
 * @param {string} supplierCode - O código do fornecedor.
 * @returns {string} O nome do fornecedor ou o próprio código se não encontrado.
 */
function getSupplierNameFromCode(supplierCode) {
    return supplierNameMap[supplierCode] || supplierCode;
}

/**
 * Função de logout para redefinir o estado da aplicação e retornar à tela de login.
 */
function logout() {
    productsInCurrentOrder = [];
    userRole = 'guest';
    generatedPurchaseOrders = JSON.parse(JSON.stringify(initialGeneratedPurchaseOrders)); // Reseta POs geradas
    simulatedSupplierOrders = {};
    simulatedColombiaOrder = null;
    currentOrderDetails = null;
    currentViewingPO = null;
    currentPurchasingPO = null;
    
    // Recalcula os contadores de ID com base nos pedidos existentes
    const maxSolId = orders.reduce((max, order) => {
        const solNum = order.parentOrderId && typeof order.parentOrderId === 'string'
                       ? parseInt(order.parentOrderId.replace('SOL-', ''))
                       : 0;
        return isNaN(solNum) ? max : Math.max(max, solNum);
    }, 0);
    nextParentRequestCounter = maxSolId + 1;

    const maxPedId = orders.reduce((max, order) => {
        const pedNum = order.orderId && typeof order.orderId === 'string' && order.orderId.startsWith('PED-')
                       ? parseInt(order.orderId.replace('PED-', ''))
                       : 0;
        return isNaN(pedNum) ? max : Math.max(max, pedNum);
    }, 0);
    nextPurchaseOrderIdCounter = maxPedId + 1;

    const maxSapId = orders.reduce((max, order) => {
        const sapNum = order.orderId && typeof order.orderId === 'string' && order.orderId.startsWith('SAP-')
                       ? parseInt(order.orderId.replace('SAP-', ''))
                       : 0;
        return isNaN(sapNum) ? max : Math.max(max, sapNum);
    }, 0);
    nextSapOrderIdCounter = maxSapId + 1;

    currentParentOrderId = null;

    // Limpa os campos de login
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';

    showScreen('login-page');
}

/**
 * Reinicia o fluxo da aplicação, efetuando logout e retornando à tela de login.
 */
function restartFlow() {
    logout();
}

/**
 * Preenche o filtro de fornecedores na tela da Central de Pedidos.
 */
function populateSupplierFilter() {
    const supplierFilterSelect = document.getElementById('fornecedor');
    supplierFilterSelect.innerHTML = '<option value="Todos">Todos</option>'; // Opção padrão

    const uniqueSuppliers = new Set();
    orders.forEach(order => {
        if (order.supplier) {
            uniqueSuppliers.add(order.supplier);
        }
    });

    // Ordena os códigos de fornecedor numericamente
    const sortedSupplierCodes = Array.from(Object.keys(supplierNameMap)).sort((a, b) => parseInt(a) - parseInt(b));
    
    sortedSupplierCodes.forEach(supplierCode => {
        const option = document.createElement('option');
        option.value = supplierCode;
        option.innerText = `${supplierCode}`; // Exibe apenas o código
        supplierFilterSelect.appendChild(option);
    });
}

/**
 * Preenche o filtro de país de origem na tela da Central de Pedidos.
 */
function populateOriginCountryFilter() {
    const originCountryFilterSelect = document.getElementById('paisOrigem');
    originCountryFilterSelect.innerHTML = '<option value="Todos">Todos</option>'; // Opção padrão

    const uniqueCountries = new Set();
    orders.forEach(order => {
        if (order.originCountry) {
            uniqueCountries.add(order.originCountry);
        }
    });

    Array.from(uniqueCountries).sort().forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.innerText = country;
        originCountryFilterSelect.appendChild(option);
    });
}

/**
 * Sincroniza os dados entre `orders` e `generatedPurchaseOrders` e atualiza as tabelas.
 * Usado após alterações nos status de POs.
 */
function synchronizeOrdersAndPOs() {
    orders.forEach(order => {
        const correspondingPO = generatedPurchaseOrders.find(po => po.id === order.orderId);
        if (correspondingPO) {
            order.status = correspondingPO.overallApprovalStatus;
            order.lastUpdateDate = new Date().toISOString().slice(0, 10);

            // Atualiza o status do pedido principal com base no status da PO
            if (correspondingPO.overallApprovalStatus === 'Aprovado' && order.originCountry === 'Hong Kong') {
                order.status = 'Em Produção';
            }
            else if (correspondingPO.overallApprovalStatus === 'Negociado') {
                order.status = 'Em Negociação';
            }
            else if (correspondingPO.overallApprovalStatus === 'Finalizado') {
                order.status = 'Finalizado';
            }
        }
    });
    // Re-renderiza as tabelas relevantes se o usuário estiver nelas
    if (currentScreen === 'central-pedidos-page') {
        renderOrdersTable();
    } else if (currentScreen === 'purchasingCenterScreen') {
        renderPurchasingCenterTables();
    } else if (currentScreen === 'renatoApprovalScreen') {
        // Garante que a aba ativa seja re-renderizada corretamente
        const activeTabButton = document.querySelector('#renatoApprovalTabButtons .tab-button.active');
        if (activeTabButton) {
            switchRenatoApprovalTab(activeTabButton.onclick.toString().match(/switchRenatoApprovalTab\('(\w+)'\)/)[1]);
        } else {
            switchRenatoApprovalTab('pendingApproval'); // Fallback
        }
    }
}

/**
 * Alterna a visibilidade do conteúdo de um "collapsible" (acordeão).
 * @param {HTMLElement} headerElement - O elemento do cabeçalho do acordeão clicado.
 * @param {string} contentId - O ID do conteúdo do acordeão a ser alternado.
 */
function toggleCollapsible(headerElement, contentId) {
    const content = document.getElementById(contentId);
    const arrow = headerElement.querySelector('.arrow');
    if (content.classList.contains('active')) {
        content.classList.remove('active');
        headerElement.classList.remove('active');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
    } else {
        // Fecha outros acordeões abertos
        document.querySelectorAll('.accordion-content.active').forEach(openContent => {
            openContent.classList.remove('active');
            openContent.previousElementSibling.classList.remove('active');
            const openArrow = openContent.previousElementSibling.querySelector('.arrow');
            if (openArrow) openArrow.style.transform = 'rotate(0deg)';
        });

        content.classList.add('active');
        headerElement.classList.add('active');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
    }
}

/**
 * Abre o modal do catálogo de produtos.
 */
function openProductCatalogModal() {
    const productCatalogList = document.getElementById('productCatalogList');
    productCatalogList.innerHTML = ''; // Limpa o conteúdo anterior

    let tableHtml = `<table class="data-table">
                        <thead>
                            <tr>
                                <th>Cód Prod Cliente</th>
                                <th>Cód Produto</th>
                                <th>Descrição</th>
                                <th>Filial Padrão</th>
                                <th>Preço Unit.</th>
                                <th>MOQ</th>
                                <th>Estoque</th>
                                <th>M³ Unit.</th>
                                <th>Linha</th>
                            </tr>
                        </thead>
                        <tbody>`;

    // Popula a tabela com os dados do productDatabase
    for (const code in productDatabase) {
        const product = productDatabase[code];
        const displayPrice = product.tableValue !== undefined && product.tableValue !== null
            ? product.tableValue.toFixed(2).replace('.', ',')
            : 'N/A';

        const stockDisplay = product.simulatedStock > 0 ? 'Sim' : 'Não';
        const stockColor = product.simulatedStock > 0 ? 'var(--green-success)' : 'var(--red-alert)';

        tableHtml += `
            <tr onclick="selectProductFromCatalog('${product.clientCode}')">
                <td class="product-code-display">${product.clientCode}</td>
                <td class="product-code-display">${product.code}</td>
                <td class="product-description-display">${product.description}</td>
                <td>${product.originCountry}</td>
                <td>R$ ${displayPrice}</td>
                <td>${product.moq}</td>
                <td><span style="color: ${stockColor}; font-weight: bold;">${stockDisplay}</span></td>
                <td>${product.cubageUnit.toFixed(3).replace('.', ',')}</td>
                <td class="product-line-display">${product.productLine}</td>
            </tr>
        `;
    }
    tableHtml += `</tbody></table>`;
    productCatalogList.innerHTML = tableHtml;

    // Limpa o campo de busca ao abrir o modal
    document.getElementById('productCatalogSearchInput').value = '';
    // Exibe o modal
    document.getElementById('productCatalogModal').classList.add('active');
}

/**
 * Filtra os produtos exibidos no catálogo de produtos.
 */
function filterProductCatalog() {
    const searchTerm = document.getElementById('productCatalogSearchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#productCatalogList tbody tr');

    rows.forEach(row => {
        const clientCode = row.children[0].innerText.toLowerCase();
        const productCode = row.children[1].innerText.toLowerCase();
        const description = row.children[2].innerText.toLowerCase();
        const branch = row.children[3].innerText.toLowerCase(); // Adicionado filtro por filial

        if (clientCode.includes(searchTerm) || productCode.includes(searchTerm) || description.includes(searchTerm) || branch.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

/**
 * Seleciona um produto do catálogo e preenche os campos do formulário de nova solicitação.
 * @param {string} clientProductCode - O código do produto do cliente selecionado.
 */
function selectProductFromCatalog(clientProductCode) {
    document.getElementById('clientProductCode').value = clientProductCode;
    updateProductDetailsOnClientCodeChange(); // Atualiza os detalhes do produto com base no código selecionado
    closeProductCatalogModal(); // Fecha o modal
}

/**
 * Fecha o modal do catálogo de produtos.
 */
function closeProductCatalogModal() {
    document.getElementById('productCatalogModal').classList.remove('active');
}

/**
 * Abre o modal do fluxograma.
 */
function openFlowchartModal() {
    document.getElementById('flowchartModal').classList.add('active');
}

/**
 * Fecha o modal do fluxograma.
 */
function closeFlowchartModal() {
    document.getElementById('flowchartModal').classList.remove('active');
}

/**
 * Exibe o nome do arquivo selecionado em um elemento de exibição.
 * @param {string} inputId - O ID do input de arquivo.
 * @param {string} displayId - O ID do span para exibir o nome do arquivo.
 */
function displayFileName(inputId, displayId) {
    const fileInput = document.getElementById(inputId);
    const fileNameDisplay = document.getElementById(displayId);
    if (fileInput.files.length > 0) {
        fileNameDisplay.innerText = fileInput.files[0].name;
    } else {
        fileNameDisplay.innerText = 'Nenhum arquivo selecionado';
    }
}

// Inicialização da aplicação ao carregar o DOM
document.addEventListener('DOMContentLoaded', () => {
    // Popula o mapa de códigos de fornecedor
    orders.forEach(order => {
        if (order.supplier) {
            getOrGenerateSupplierCode(order.supplier);
        }
    });

    // Calcula os próximos IDs de solicitação e pedido
    const maxSolId = orders.reduce((max, order) => {
        const solNum = order.parentOrderId && typeof order.parentOrderId === 'string'
                       ? parseInt(order.parentOrderId.replace('SOL-', ''))
                       : 0;
        return isNaN(solNum) ? max : Math.max(max, solNum);
    }, 0);
    nextParentRequestCounter = maxSolId + 1;

    const maxPedId = orders.reduce((max, order) => {
        const pedNum = order.orderId && typeof order.orderId === 'string' && order.orderId.startsWith('PED-')
                       ? parseInt(order.orderId.replace('PED-', ''))
                       : 0;
        return isNaN(pedNum) ? max : Math.max(max, pedNum);
    }, 0);
    nextPurchaseOrderIdCounter = maxPedId + 1;

    const maxSapId = orders.reduce((max, order) => {
        const sapNum = order.orderId && typeof order.orderId === 'string' && order.orderId.startsWith('SAP-')
                       ? parseInt(order.orderId.replace('SAP-', ''))
                       : 0;
        return isNaN(sapNum) ? max : Math.max(max, sapNum);
    }, 0);
    nextSapOrderIdCounter = maxSapId + 1;
    
    // Limpa os campos de login ao carregar a página
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    showScreen('login-page'); // Exibe a tela de login inicialmente
});

