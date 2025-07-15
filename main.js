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
                orderId: 'PED-012', parentOrderId: 'SOL-012', clientFlag: assignClientName('Colômbia'), originCountry: 'Colômbia',
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

        function getOrGenerateSupplierCode(supplierName) {
            if (!supplierCodeMap[supplierName]) {
                supplierCodeMap[supplierName] = String(nextSupplierCode);
                supplierNameMap[String(nextSupplierCode)] = supplierName;
                nextSupplierCode += 11;
            }
            return supplierCodeMap[supplierName];
        }

        function showScreenInfo() {
            let info = '';
            switch (currentScreen) {
                case 'orderCenterScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">📂 Central de Pedidos</h2>
                        <p>Bem-vindo à <b>Central de Pedidos</b>! Aqui você pode gerenciar e acompanhar todas as solicitações do início ao fim.</p>
                        <hr style="margin:16px 0;">
                        <h3 style="font-size:1.1rem; font-weight:bold;">🔍 Busca e Filtros</h3>
                        <ul style="margin-bottom:10px;">
                        <li>Filtre pedidos por <b>Status</b>, <b>Fornecedor</b> (código), <b>País de Origem</b> (Colômbia ou Hong Kong) ou <b>Cliente</b>.</li>
                        <li>Utilize a busca rápida por número do pedido, ID principal ou nome do cliente.</li>
                        </ul>
                        <h3 style="font-size:1.1rem; font-weight:bold;">📋 Visualização dos Pedidos</h3>
                        <ul style="margin-bottom:10px;">
                        <li>Veja todos os pedidos em uma tabela detalhada.</li>
                        <li>Clique no número do pedido para acessar os detalhes completos.</li>
                        </ul>
                        <h3 style="font-size:1.1rem; font-weight:bold;">🆕 Nova Solicitação</h3>
                        <ul style="margin-bottom:10px;">
                        <li>Clique em <b>Nova Solicitação</b> para iniciar um novo pedido, escolhendo a filial de destino (<b>Hong Kong</b> ou <b>Colômbia</b>).</li>
                        </ul>
                        <h3 style="font-size:1.1rem; font-weight:bold;">🟢 Dicas Visuais</h3>
                        <ul>
                        <li><b>Cores dos status:</b>
                            <span style="color:#16a34a;">🟢 Aprovado</span> |
                            <span style="color:#eab308;">🟡 Pendente</span> |
                            <span style="color:#dc2626;">🔴 Rejeitado</span> |
                            <span style="color:#3b82f6;">🔵 Em andamento</span> |
                            <span style="color:#6b7280;">⚪ Cancelado</span>
                        </li>
                        <li><b>Ícones de bandeira:</b> Indicam o país de origem do pedido.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;">Se precisar de ajuda, clique novamente neste ícone ou consulte o manual do usuário.</p>
                    `;
                    break;
                case 'orderDetailsScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">📄 Detalhes do Pedido</h2>
                        <p>Veja todas as informações detalhadas do pedido selecionado:</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li><b>Dados Gerais:</b> Número do pedido, ID principal, origem, fornecedor, valores e datas.</li>
                        <li><b>Status do Pedido:</b> Acompanhe o andamento por meio do rastreamento visual com etapas e cores.</li>
                        <li><b>Produtos:</b> Lista completa de itens, quantidades e valores.</li>
                        <li><b>Ações:</b> Utilize o botão para voltar à Central de Pedidos.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> O rastreamento mostra cada etapa do fluxo logístico do pedido.</p>
                    `;
                    break;
                case 'newOrderFormScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">📝 Nova Solicitação de Compra</h2>
                        <p>Crie uma nova solicitação de compra. Adicione produtos e selecione a filial de origem para cada uno.</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li><b>Pedido Fácil:</b> Adicione produtos rapidamente via upload de planilha ou colando códigos (para grandes volumes).</li>
                        <li><b>Pedido Manual:</b> Insira produtos individualmente, consultando o catálogo se necessário. A <b>Filial</b> (Hong Kong ou Colômbia) será selecionada na tabela de produtos adicionados.</li>
                        <li><b>Validação:</b> O sistema valida automaticamente a quantidade mínima de compra (MOQ) para Hong Kong e o estoque disponível para Colômbia, com base na filial do produto.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> A validação de estoque e MOQ é feita por produto, de acordo com a filial do produto!</p>
                    `;
                    break;
                case 'summaryScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">📊 Resumo da Solicitação</h2>
                        <p>Revise a divisão dos produtos por filial e fornecedor antes de confirmar.</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li><b>Pedidos Hong Kong:</b> Agrupados por fornecedor, com validação de MOQ e comparação de custos.</li>
                        <li><b>Pedidos Colômbia:</b> Um único pedido para todos os itens, com detalhes da NF-e simulada.</li>
                        <li><b>Ações:</b> Volte para ajustar os produtos ou confirme para gerar os pedidos de compra.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> Verifique cuidadosamente as informações de MOQ e estoque antes de confirmar.</p>
                    `;
                    break;
                case 'renatoApprovalScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">👔 Aprovação de Preços - Gerencial</h2>
                        <p>Nesta tela, a gerência pode:</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li><b>Analisar pedidos pendentes</b> enviados pelo time de compras.</li>
                        <li><b>Comparar preços</b> entre valores internos e valores negociados com fornecedores.</li>
                        <li><b>Aprovar, negociar ou rejeitar</b> cada produto individualmente.</li>
                        <li><b>Finalizar a aprovação</b> para liberar o andamento do pedido.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> Use os botões de ação para definir o status de cada item antes de finalizar.</p>
                    `;
                    break;
                case 'purchasingCenterScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">🛒 Central de Compras</h2>
                        <p>Área exclusiva para o time de compras:</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li><b>Visualize solicitações</b> recebidas dos clientes.</li>
                        <li><b>Negocie preços</b> com fornecedores e registre as condições negociadas.</li>
                        <li><b>Solicite aprovação gerencial</b> para pedidos negociados.</li>
                        <li><b>Acompanhe o status</b> dos pedidos em todas as etapas do fluxo de compras.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> Utilize as abas para navegar entre solicitações, negociações e aprovações.</p>
                        <p style="font-size:0.95rem;"><b>Atenção:</b> Jornada desenhada para o comprador(PCP) inserir o preço do fornecedor manualmente, porém, vamos disponibilizar acesso para cada fornecedor entrar na plataforma e incluir seu preço.</p>

                    `;
                    break;
                case 'purchasingOrderDetailsScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">📑 Detalhes do Pedido de Compra</h2>
                        <p>Aqui você pode:</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li>Visualizar todos os produtos do pedido, quantidades e valores.</li>
                        <li>Editar o valor negociado com o fornecedor (se permitido).</li>
                        <li>Salvar negociações, solicitar aprovação ou finalizar o processo.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> Altere os valores unitários negociados diretamente na tabela, se necessário.</p>
                    `;
                    break;
                case 'purchaseOrderScreen':
                    info = `
                        <h2 style="font-size:1.3rem; font-weight:bold; margin-bottom:10px;">✅ Solicitação Gerada</h2>
                        <p>Sua solicitação foi gerada e enviada para Compras Internacionais.</p>
                        <hr style="margin:16px 0;">
                        <ul style="margin-bottom:10px;">
                        <li>Veja os detalhes da PO (Purchase Order).</li>
                        <li>Aguarde a negociação e aprovação do gestor.</li>
                        <li>Utilize o botão para voltar à Central de Pedidos.</li>
                        </ul>
                        <hr style="margin:16px 0;">
                        <p style="font-size:0.95rem;"><b>Dica:</b> Acompanhe o status do pedido na Central de Pedidos.</p>
                    `;
                    break;
                default:
                    info = '<p>Esta tela faz parte do fluxo do portal. Para mais informações, consulte o manual ou o suporte.</p>';
            }
            showMessage('Informações da Tela', info, 'info');
        }

        function getSupplierNameFromCode(supplierCode) {
            return supplierNameMap[supplierCode] || supplierCode;
        }
        
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

        function showScreen(screenId) {
            document.querySelectorAll('.page').forEach(screen => {
                screen.classList.remove('active');
            });
            document.getElementById(screenId).classList.add('active');
            currentScreen = screenId;

            if (screenId === 'newOrderFormScreen') {
                resetNewOrderForm();
            }

            const simulateRenatoBtn = document.getElementById('simulateRenatoBtn');
            if (simulateRenatoBtn) {
                if (userRole === 'client') {
                    simulateRenatoBtn.classList.add('hidden');
                } else {
                    simulateRenatoBtn.classList.remove('hidden');
                }
            }
        }

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

        function displayAddProductMessage(message, type) {
            const messageDiv = document.getElementById('addProductMessage');
            
            messageDiv.innerText = message;
            messageDiv.className = `validation-message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }

        function login() {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username === 'cliente' && password === 'cliente') {
                userRole = 'client';
                showScreen('central-pedidos-page');
                populateSupplierFilter();
                populateOriginCountryFilter();
                renderOrdersTable();
            } else if (username === 'compras' && password === 'compras') {
                userRole = 'compras';
                showScreen('purchasingCenterScreen');
                setTimeout(() => {
                    switchPurchasingTab('novasSolicitacoes');
                }, 0);
            }
             else if (username === 'gestor' && password === 'gestor') {
                userRole = 'gestor';
                showScreen('renatoApprovalScreen');
                switchRenatoApprovalTab('pendingApproval'); // Default to pending approval tab
            }
            else if (username === 'dimpex' && password === 'dimpex') {
                userRole = 'dimpex';
                window.location.href = 'dimpex.html';
            }
            else {
                showMessage('Erro de Login', 'Utilizador ou palavra-passe inválidos.', 'error');
            }
        }

        function resetNewOrderForm() {
            document.getElementById('clientOrderNumber').value = '';
            productsInCurrentOrder = [];
            renderProductList();

            document.getElementById('easyOrderTab').classList.add('active');
            document.getElementById('manualOrderTab').classList.remove('active');

            document.getElementById('clientProductCode').value = '';
            document.getElementById('mappedProductCodeDisplay').value = '--';
            document.getElementById('productDescriptionDisplay').value = '--';
            document.getElementById('productQuantity').value = '1';
            document.getElementById('validationFeedback').innerText = '';
            document.getElementById('productValueDisplay').value = 'R$ 0,00';
            document.getElementById('totalM3Display').value = '0.00 m³';
            document.getElementById('valorTotalDisplay').value = '0.00 m³';
            document.getElementById('productStockDisplay').value = '--';

            document.getElementById('totalM3Group').style.display = 'none';
            document.getElementById('valorTotalGroup').style.display = 'none';
            document.getElementById('productStockGroup').style.display = 'none';

            document.getElementById('fileUpload').value = '';
            document.getElementById('fileNameDisplay').innerText = 'Nenhum arquivo selecionado';
            document.getElementById('pasteCodes').value = '';
            document.getElementById('addProductMessage').style.display = 'none';

            switchOrderFormTab('easy');
        }

        function updateManualProductFieldsVisibility(productBranch) {
            const totalM3Group = document.getElementById('totalM3Group');
            const valorTotalGroup = document.getElementById('valorTotalGroup');
            const productStockGroup = document.getElementById('productStockGroup');

            if (productBranch === 'Hong Kong') {
                totalM3Group.style.display = 'block';
                valorTotalGroup.style.display = 'none';
                productStockGroup.style.display = 'none';
            } else if (productBranch === 'Colômbia') {
                totalM3Group.style.display = 'none';
                valorTotalGroup.style.display = 'block';
                productStockGroup.style.display = 'block';
            } else {
                totalM3Group.style.display = 'none';
                valorTotalGroup.style.display = 'none';
                productStockGroup.style.display = 'none';
            }
        }

        function switchOrderFormTab(tabType) {
            const manualTabContent = document.getElementById('manualOrderTab');
            const easyTabContent = document.getElementById('easyOrderTab');
            const tabButtonsContainer = document.getElementById('orderFormTabButtons');

            manualTabContent.classList.remove('active');
            easyTabContent.classList.remove('active');

            Array.from(tabButtonsContainer.children).forEach(button => {
                button.classList.remove('active');
            });

            if (tabType === 'easy') {
                easyTabContent.classList.add('active');
                tabButtonsContainer.children[0].classList.add('active');
            } else if (tabType === 'manual') {
                manualTabContent.classList.add('active');
                tabButtonsContainer.children[1].classList.add('active');
                updateProductDetailsOnClientCodeChange();
            }
        }

        function switchPurchasingTab(tabType) {
            const novasSolicitacoesTab = document.getElementById('novasSolicitacoesTab');
            const negociacoesEmAndamentoTab = document.getElementById('negociacoesEmAndamentoTab');
            const pendenteGerenciaTab = document.getElementById('pendenteGerenciaTab');
            const aprovadoGerenciaTab = document.getElementById('aprovadoGerenciaTab');

            const tabButtonsContainer = document.getElementById('purchasingTabButtons');

            novasSolicitacoesTab.classList.remove('active');
            negociacoesEmAndamentoTab.classList.remove('active');
            pendenteGerenciaTab.classList.remove('active');
            aprovadoGerenciaTab.classList.remove('active');

            Array.from(tabButtonsContainer.children).forEach(button => {
                button.classList.remove('active');
            });

            if (tabType === 'novasSolicitacoes') {
                novasSolicitacoesTab.classList.add('active');
                tabButtonsContainer.children[0].classList.add('active');
            } else if (tabType === 'negociacoesEmAndamento') {
                negociacoesEmAndamentoTab.classList.add('active');
                tabButtonsContainer.children[1].classList.add('active');
            }
            else if (tabType === 'pendenteGerencia') {
                pendenteGerenciaTab.classList.add('active');
                tabButtonsContainer.children[2].classList.add('active');
            } else if (tabType === 'aprovadoGerencia') {
                aprovadoGerenciaTab.classList.add('active');
                tabButtonsContainer.children[3].classList.add('active');
            }
            renderPurchasingCenterTables();
        }

        function switchRenatoApprovalTab(tabType) {
            const pendingApprovalTab = document.getElementById('pendingApprovalTab');
            const rejectedOrdersTab = document.getElementById('rejectedOrdersTab');
            const tabButtonsContainer = document.getElementById('renatoApprovalTabButtons');

            pendingApprovalTab.classList.remove('active');
            rejectedOrdersTab.classList.remove('active');

            Array.from(tabButtonsContainer.children).forEach(button => {
                button.classList.remove('active');
            });

            if (tabType === 'pendingApproval') {
                pendingApprovalTab.classList.add('active');
                tabButtonsContainer.children[0].classList.add('active');
                renderPendingRenatoApprovalList();
            } else if (tabType === 'rejectedOrders') {
                rejectedOrdersTab.classList.add('active');
                tabButtonsContainer.children[1].classList.add('active');
                renderRejectedRenatoApprovalList();
            }
        }

        function backToOrderCenter() {
            showScreen('central-pedidos-page');
            renderOrdersTable();
        }

        function backToProductEntry() {
            showScreen('newOrderFormScreen');
            renderProductList();
        }

        function backToPurchasingCenter() {
            currentPurchasingPO = null;
            showScreen('purchasingCenterScreen');
            const activeTabButton = document.querySelector('#purchasingTabButtons .tab-button.active');
            if (activeTabButton) {
                switchPurchasingTab(activeTabButton.onclick.toString().match(/switchPurchasingTab\('(\w+)'\)/)[1]);
            } else {
                renderPurchasingCenterTables();
            }
        }

        function closeProductCatalogModal() {
            document.getElementById('productCatalogModal').classList.remove('active');
        }

        function logout() {
            productsInCurrentOrder = [];
            userRole = 'guest';
            generatedPurchaseOrders = JSON.parse(JSON.stringify(initialGeneratedPurchaseOrders));
            simulatedSupplierOrders = {};
            simulatedColombiaOrder = null;
            currentOrderDetails = null;
            currentViewingPO = null;
            currentPurchasingPO = null;
            
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

            document.getElementById('username').value = '';
            document.getElementById('password').value = '';

            showScreen('login-page');
        }

        function restartFlow() {
            logout();
        }

        function populateSupplierFilter() {
            const supplierFilterSelect = document.getElementById('fornecedor');
            supplierFilterSelect.innerHTML = '<option value="Todos">Todos</option>';

            const uniqueSuppliers = new Set();
            orders.forEach(order => {
                if (order.supplier) {
                    uniqueSuppliers.add(order.supplier);
                }
            });

            const sortedSupplierCodes = Array.from(Object.keys(supplierNameMap)).sort((a, b) => parseInt(a) - parseInt(b));
            
            sortedSupplierCodes.forEach(supplierCode => {
                const option = document.createElement('option');
                option.value = supplierCode;
                option.innerText = `${supplierCode}`;
                supplierFilterSelect.appendChild(option);
            });
        }

        function populateOriginCountryFilter() {
            const originCountryFilterSelect = document.getElementById('paisOrigem');
            originCountryFilterSelect.innerHTML = '<option value="Todos">Todos</option>';

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

        function renderOrdersTable() {
            const tbody = document.querySelector('#central-pedidos-page table tbody');
            tbody.innerHTML = '';

            const statusFilter = document.getElementById('status').value;
            const supplierFilterCode = document.getElementById('fornecedor').value;
            const originCountryFilter = document.getElementById('paisOrigem').value;
            const orderSearchQuery = document.getElementById('search').value.toLowerCase();

            const getFlagImage = (country) => {
                if (!country || typeof country !== 'string') {
                    return '<span class="flag-icon">🚩</span>';
                }
                switch(country.toLowerCase()) {
                    case 'colômbia':
                        return '<img src="https://e7.pngegg.com/pngimages/796/10/png-clipart-flag-of-colombia-flag-of-cambodia-colombia-flag-flag-sphere-thumbnail.png" alt="Bandeira da Colômbia" class="flag-icon">';
                    case 'hong kong':
                        return '<img src="https://e7.pngegg.com/pngimages/630/750/png-clipart-flag-of-china-association-of-southeast-asian-nations-national-flag-asean%E3%81%AE%E7%B4%8B%E7%AB%A0-china-orange-world-thumbnail.png" alt="Bandeira de Hong Kong" class="flag-icon">';
                    default:
                        return '<span class="flag-icon">🚩</span>';
                }
            };

            let filteredOrders = orders.filter(order => {
                const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
                const matchesSupplier = supplierFilterCode === 'Todos' || getOrGenerateSupplierCode(order.supplier) === supplierFilterCode; 
                const matchesOriginCountry = originCountryFilter === 'Todos' || order.originCountry === originCountryFilter;
                const matchesSearch = orderSearchQuery === '' ||
                                      order.orderId.toLowerCase().includes(orderSearchQuery) ||
                                      (order.parentOrderId && order.parentOrderId.toLowerCase().includes(orderSearchQuery)) ||
                                      (order.clientFlag && order.clientFlag.toLowerCase().includes(orderSearchQuery));
                return matchesStatus && matchesSupplier && matchesOriginCountry && matchesSearch;
            });

            filteredOrders.sort((a, b) => {
                const idA = (a.parentOrderId && typeof a.parentOrderId === 'string') ? parseInt(a.parentOrderId.replace('SOL-', '')) : 0;
                const idB = (b.parentOrderId && typeof b.parentOrderId === 'string') ? parseInt(b.parentOrderId.replace('SOL-', '')) : 0;
                return idA - idB;
            });

            if (filteredOrders.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center py-4 text-gray-500">Nenhum pedido encontrado com os filtros aplicados.</td></tr>`;
                return;
            }

            filteredOrders.forEach(order => {
                const row = document.createElement('tr');
                
                let statusIndicatorClass = '';
                switch (order.status) {
                    case 'Aprovado':
                    case 'Carga Pronta':
                    case 'Documentação OK':
                    case 'Chegada no Porto de Destino (ATA)':
                    case 'Entregue':
                    case 'Negociado':
                    case 'Finalizado':
                    case 'Em Produção':
                        statusIndicatorClass = 'green';
                        break;
                    case 'Pendente':
                    case 'Aguardando Aprovação':
                    case 'Em Negociação':
                    case 'Documentação Pendente':
                        statusIndicatorClass = 'yellow';
                        break;
                    case 'Rejeitado':
                        statusIndicatorClass = 'red';
                        break;
                    case 'Saída do Porto de Embarque (ATD)':
                    case 'Em Separação':
                    case 'Em Conferência':
                    case 'Em Rota de Entrega':
                        statusIndicatorClass = 'blue';
                        break;
                    case 'Cancelado':
                        statusIndicatorClass = 'gray';
                        break;
                    default:
                        statusIndicatorClass = 'yellow';
                }

                const flagImageHtml = getFlagImage(order.originCountry);
                const displaySupplierInfo = userRole === 'client' && order.supplier
                    ? getOrGenerateSupplierCode(order.supplier)
                    : (order.supplier || 'N/A');

                row.innerHTML = `
                    <td>${order.parentOrderId || 'N/A'}</td>
                    <td><a href="#" class="pedido-link" onclick="viewOrderDetails('${order.orderId}')">${order.orderId}</a></td>
                    <td>${flagImageHtml}</td>
                    <td>${order.originCountry}</td>
                    <td>${displaySupplierInfo}</td>
                    <td>R$ ${(order.totalValue || 0).toFixed(2).replace('.', ',')}</td>
                    <td><span class="status-indicator ${statusIndicatorClass}"></span>${order.status}</td>
                    <td>${order.requestDate}</td>
                    <td>${order.lastUpdateDate}</td>
                `;
                tbody.appendChild(row);
            });
        }

        function viewOrderDetails(orderId) {
            currentOrderDetails = orders.find(order => order.orderId === orderId);
            if (!currentOrderDetails) {
                showMessage('Erro', 'Detalhes do pedido não encontrados.', 'error');
                return;
            }

            document.getElementById('currentOrderId').innerText = currentOrderDetails.orderId;
            document.getElementById('detailOrderId').innerText = currentOrderDetails.orderId;
            document.getElementById('detailParentOrderId').innerText = currentOrderDetails.parentOrderId || 'N/A';

            const getFlagImageForDetails = (country) => {
                if (!country || typeof country !== 'string') {
                    return '<span class="mr-2 flag-icon">🚩</span>';
                }
                switch(country.toLowerCase()) {
                    case 'colômbia':
                        return '<img src="https://e7.pngegg.com/pngimages/796/10/png-clipart-flag-of-colombia-flag-of-cambodia-colombia-flag-flag-sphere-thumbnail.png" alt="Bandeira da Colômbia" class="flag-icon inline-block mr-2">';
                    case 'hong kong':
                        return '<img src="https://e7.pngegg.com/pngimages/630/750/png-clipart-flag-of-china-association-of-southeast-asian-nations-national-flag-asean%E3%81%AE%E7%B4%8B%E7%AB%A0-china-orange-world-thumbnail.png" alt="Bandeira de Hong Kong" class="flag-icon inline-block mr-2">';
                    default:
                        return '<span class="mr-2 flag-icon">🚩</span>';
                }
            };
            document.getElementById('detailOriginDisplay').innerHTML = `${getFlagImageForDetails(currentOrderDetails.originCountry)}${currentOrderDetails.originCountry}`;

            const detailSupplierElement = document.getElementById('detailSupplier');
            detailSupplierElement.innerText = userRole === 'client' && currentOrderDetails.supplier
                ? getOrGenerateSupplierCode(currentOrderDetails.supplier)
                : (currentOrderDetails.supplier || 'N/A');

            document.getElementById('detailTotalValue').innerText = `R$ ${currentOrderDetails.totalValue.toFixed(2).replace('.', ',')}`;
            document.getElementById('detailStatus').innerText = currentOrderDetails.status;
            document.getElementById('detailRequestDate').innerText = currentOrderDetails.requestDate;
            document.getElementById('detailLastUpdateDate').innerText = currentOrderDetails.lastUpdateDate;


            const productsTableBody = document.getElementById('orderDetailsProductsTableBody');
            productsTableBody.innerHTML = '';

            currentOrderDetails.products.forEach(product => {
                const row = document.createElement('tr');
                const itemTotalPrice = (product.quantity * product.unitPrice).toFixed(2);
                row.innerHTML = `
                    <td>${product.code}</td>
                    <td>${product.description}</td>
                    <td>${product.quantity}</td>
                    <td>R$ ${product.unitPrice.toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${itemTotalPrice.replace('.', ',')}</td>
                `;
                productsTableBody.appendChild(row);
            });

            renderTracking(currentOrderDetails);
            showScreen('orderDetailsScreen');
        }

        function renderTracking(order) {
            const trackingSection = document.getElementById('orderTrackingSection');
            trackingSection.innerHTML = '';

            let flow = [];
            if (order.originCountry === 'Hong Kong') {
                flow = hongKongTrackingFlow;
            } else if (order.originCountry === 'Colômbia') {
                flow = colombiaTrackingFlow;
            } else {
                trackingSection.innerHTML = '<p class="text-gray-500 text-center">Rastreamento não disponível para esta origem.</p>';
                return;
            }

            let currentStatusIndex = flow.findIndex(step => step.name === order.status);

            const isTerminalStatus = ['Rejeitado', 'Cancelado', 'Finalizado', 'Entregue'].includes(order.status);
            
            let trackingHtml = '<div class="tracking-steps">';

            flow.forEach((step, index) => {
                let stepClass = '';
                let circleContent = '';

                if (isTerminalStatus) {
                    if (index < currentStatusIndex) {
                        stepClass = 'completed';
                    } else if (index === currentStatusIndex) {
                        stepClass = 'active';
                    } else {
                        stepClass = 'future';
                    }
                } else {
                    if (index < currentStatusIndex) {
                        stepClass = 'completed';
                    } else if (index === currentStatusIndex) {
                        stepClass = 'active';
                    } else {
                        stepClass = 'future';
                    }
                }
                
                if (stepClass === 'completed' || stepClass === 'active') {
                    if (step.class) {
                        stepClass += ` ${step.class}`;
                    }
                }

                if (stepClass.includes('completed')) {
                    circleContent = '&#10003;';
                } else if (stepClass.includes('active')) {
                    circleContent = (index + 1).toString();
                }

                trackingHtml += `
                    <div class="tracking-step ${stepClass}">
                        <div class="circle">${circleContent}</div>
                        <span>${step.name}</span>
                    </div>
                `;
            });
            trackingHtml += '</div>';
            trackingSection.innerHTML = trackingHtml;
        }

        function updateProductDetailsOnClientCodeChange() {
            const clientProductCodeInput = document.getElementById('clientProductCode').value.trim().toUpperCase();
            const mappedProductCodeDisplay = document.getElementById('mappedProductCodeDisplay');
            const productDescriptionDisplay = document.getElementById('productDescriptionDisplay');
            const productValueDisplay = document.getElementById('productValueDisplay');
            const totalM3Display = document.getElementById('totalM3Display');
            const valorTotalDisplay = document.getElementById('valorTotalDisplay');
            const productStockDisplay = document.getElementById('productStockDisplay');
            const validationFeedbackDiv = document.getElementById('validationFeedback');
            const productQuantityInput = document.getElementById('productQuantity');

            mappedProductCodeDisplay.value = '--';
            productDescriptionDisplay.value = '--';
            productValueDisplay.value = 'R$ 0,00';
            totalM3Display.value = '0.00 m³';
            valorTotalDisplay.value = '0.00 m³';
            productStockDisplay.value = '--';
            validationFeedbackDiv.innerText = '';
            validationFeedbackDiv.className = 'text-xs mt-1';
            productStockDisplay.style.color = '';

            const productCode = universalClientCodeToProductCodeMap[clientProductCodeInput];
            const productInfo = productDatabase[productCode];

            if (productInfo) {
                mappedProductCodeDisplay.value = productCode;
                productDescriptionDisplay.value = productInfo.description;
                productDescriptionDisplay.style.color = '#374151';
                productValueDisplay.value = `R$ ${productInfo.tableValue.toFixed(2).replace('.', ',')}`;

                updateManualProductFieldsVisibility(productInfo.originCountry);

                if (productInfo.originCountry === 'Hong Kong') {
                    totalM3Display.value = `${(productInfo.cubageUnit * parseInt(productQuantityInput.value || 1)).toFixed(2).replace('.', ',')} m³`;
                } else if (productInfo.originCountry === 'Colômbia') {
                    productStockDisplay.value = productInfo.simulatedStock > 0 ? 'Sim' : 'Não';
                    productStockDisplay.style.color = productInfo.simulatedStock > 0 ? '#16a34a' : '#dc2626';
                    valorTotalDisplay.value = `R$ ${(productInfo.tableValue * parseInt(productQuantityInput.value || 1)).toFixed(2).replace('.', ',')}`;
                }

                handleQuantityChange();
            } else {
                productDescriptionDisplay.value = 'Cód Prod Cliente não encontrado.';
                productDescriptionDisplay.style.color = '#dc2626';
                document.getElementById('totalM3Group').style.display = 'none';
                document.getElementById('valorTotalGroup').style.display = 'none';
                document.getElementById('productStockGroup').style.display = 'none';
            }
        }

        function handleQuantityChange() {
            const clientProductCode = document.getElementById('clientProductCode').value.trim().toUpperCase();
            const productCode = universalClientCodeToProductCodeMap[clientProductCode];
            const productInfo = productDatabase[productCode];
            const quantity = parseInt(document.getElementById('productQuantity').value);
            const validationFeedbackDiv = document.getElementById('validationFeedback');
            const totalM3Display = document.getElementById('totalM3Display');
            const valorTotalDisplay = document.getElementById('valorTotalDisplay');

            validationFeedbackDiv.innerText = '';
            validationFeedbackDiv.className = 'text-xs mt-1';

            if (!productInfo) {
                validationFeedbackDiv.innerText = 'Por favor, insira um código de produto válido.';
                validationFeedbackDiv.className = 'validation-message status-error';
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                validationFeedbackDiv.innerText = 'Quantidade inválida.';
                validationFeedbackDiv.className = 'validation-message status-error';
                totalM3Display.value = '0.00 m³';
                valorTotalDisplay.value = 'R$ 0,00';
                return;
            }

            if (productInfo.originCountry === 'Hong Kong') {
                const totalM3 = productInfo.cubageUnit * quantity;
                totalM3Display.value = `${totalM3.toFixed(2).replace('.', ',')} m³`;
                if (quantity < productInfo.moq) {
                    validationFeedbackDiv.innerText = `⚠️ Quantidade (${quantity}) abaixo do MOQ mínimo (${productInfo.moq}) para Hong Kong.`;
                    validationFeedbackDiv.className = 'validation-message status-warning';
                } else {
                    validationFeedbackDiv.innerText = `✅ Quantidade (${quantity}) atende ao MOQ mínimo (${productInfo.moq}) para Hong Kong.`;
                    validationFeedbackDiv.className = 'validation-message status-ok';
                }
            } else if (productInfo.originCountry === 'Colômbia') {
                const total = productInfo.tableValue * quantity;
                valorTotalDisplay.value = `R$ ${(total).toFixed(2).replace('.', ',')}`;
                if (quantity > productInfo.simulatedStock) {
                    validationFeedbackDiv.innerText = `🚫 Quantidade (${quantity}) excede o estoque disponível (${productInfo.simulatedStock}) na Colômbia.`;
                    validationFeedbackDiv.className = 'validation-message status-error';
                } else {
                    validationFeedbackDiv.innerText = `✅ Quantidade (${quantity}) disponível em estoque na Colômbia.`;
                    validationFeedbackDiv.className = 'validation-message status-ok';
                }
            }
        }

        function addProduct() {
            const clientProductCode = document.getElementById('clientProductCode').value.trim().toUpperCase();
            const productCode = universalClientCodeToProductCodeMap[clientProductCode];
            const quantity = parseInt(document.getElementById('productQuantity').value);
            const productInfo = productDatabase[productCode];

            if (!productInfo) {
                displayAddProductMessage('Erro: Código de produto cliente inválido.', 'error');
                return;
            }

            if (isNaN(quantity) || quantity <= 0) {
                displayAddProductMessage('Erro: Por favor, insira uma quantidade válida para o produto.', 'error');
                return;
            }

            const totalM3 = (productInfo.cubageUnit * quantity).toFixed(2);
            const totalValue = (productInfo.tableValue * quantity).toFixed(2);

            const existingProductIndex = productsInCurrentOrder.findIndex(p => p.code === productCode);
            if (existingProductIndex > -1) {
                productsInCurrentOrder[existingProductIndex].quantity += quantity;
                productsInCurrentOrder[existingProductIndex].totalM3 = (productInfo.cubageUnit * productsInCurrentOrder[existingProductIndex].quantity).toFixed(2);
                productsInCurrentOrder[existingProductIndex].totalValue = (productInfo.tableValue * productsInCurrentOrder[existingProductIndex].quantity).toFixed(2);
                displayAddProductMessage(`Quantidade de "${productInfo.description}" atualizada para ${productsInCurrentOrder[existingProductIndex].quantity}.`, 'success');
            } else {
                productsInCurrentOrder.push({
                    clientCode: clientProductCode,
                    code: productCode,
                    name: productInfo.description,
                    quantity: quantity,
                    moq: productInfo.moq,
                    unitPrice: productInfo.unitPrice,
                    tableValue: productInfo.tableValue,
                    cubageUnit: productInfo.cubageUnit,
                    totalM3: totalM3,
                    totalValue: totalValue,
                    supplier: productInfo.supplier,
                    simulatedStock: productInfo.simulatedStock,
                    originCountry: productInfo.originCountry,
                    selectedBranch: productInfo.originCountry
                });
                displayAddProductMessage(`"${productInfo.description}" adicionado com sucesso.`, 'success');
            }

            renderProductList();
            document.getElementById('clientProductCode').value = '';
            document.getElementById('mappedProductCodeDisplay').value = '--';
            document.getElementById('productDescriptionDisplay').value = '--';
            document.getElementById('productQuantity').value = '1';
            document.getElementById('productValueDisplay').value = 'R$ 0,00';
            document.getElementById('totalM3Display').value = '0.00 m³';
            document.getElementById('valorTotalDisplay').value = '0.00 m³';
            document.getElementById('productStockDisplay').value = '--';
            document.getElementById('validationFeedback').innerText = '';
            document.getElementById('productStockDisplay').style.color = '';
            updateManualProductFieldsVisibility('');
        }

        function removeProduct(index) {
            if (index >= 0 && index < productsInCurrentOrder.length) {
                productsInCurrentOrder.splice(index, 1);
                renderProductList();
                displayAddProductMessage('Produto removido.', 'info');
            } else {
                displayAddProductMessage('Erro: Não foi possível remover o produto. Índice inválido.', 'error');
            }
        }

        function updateProductSelectedBranch(index, newBranch) {
            productsInCurrentOrder[index].selectedBranch = newBranch;
            renderProductList();
        }

        function renderProductList() {
            const listDiv = document.getElementById('productList');
            listDiv.innerHTML = '<h3 class="font-semibold text-gray-700 mb-2">Produtos Adicionados na Solicitação:</h3>';
            if (productsInCurrentOrder.length === 0) {
                listDiv.innerHTML += '<div id="noProductsAdded" class="text-gray-500 text-center py-4">Nenhum produto adicionado ainda.</div>';
                return;
            }

            let tableHtml = `<table class="data-table" id="addedProductsTable">
                                <colgroup>
                                    <col style="width: 10%;">
                                    <col style="width: 10%;">
                                    <col style="width: 20%;">
                                    <col style="width: 8%;">
                                    <col class="colombia-col" style="width: 10%;">
                                    <col class="colombia-col" style="width: 10%;">
                                    <col class="colombia-col" style="width: 10%;">
                                    <col class="hongkong-col" style="width: 6%;">
                                    <col class="hongkong-col" style="width: 10%;">
                                    <col class="hongkong-col" style="width: 10%;">
                                    <col style="width: 12%;">
                                    <col style="width: 8%;">
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th rowspan="2">Cód Cliente</th>
                                        <th rowspan="2">Cód Produto</th>
                                        <th rowspan="2">Descrição</th>
                                        <th rowspan="2">Qtd. Solicitada</th>
                                        <th colspan="3" class="colombia-col" style="text-align: center;">Colômbia</th>
                                        <th colspan="3" class="hongkong-col" style="text-align: center;">Hong Kong</th>
                                        <th rowspan="2">Filial Selecionada</th>
                                        <th rowspan="2">Ação</th>
                                    </tr>
                                    <tr>
                                        <th class="colombia-col">Estoque</th>
                                        <th class="colombia-col">Valor Unit.</th>
                                        <th class="colombia-col">Valor Total</th>
                                        <th class="hongkong-col">MOQ</th>
                                        <th class="hongkong-col">Valor Unit.</th>
                                        <th class="hongkong-col">Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>`;
            
            productsInCurrentOrder.forEach((product, index) => {
                const productInfoFromDB = productDatabase[product.code];

                const columbiaStockStatus = productInfoFromDB.simulatedStock > 0 ? 'Sim' : 'Não';
                const columbiaStockColor = productInfoFromDB.simulatedStock > 0 ? 'var(--green-success)' : 'var(--red-alert)';
                const columbiaUnitPrice = productInfoFromDB.tableValue;
                const columbiaTotalPrice = (columbiaUnitPrice * product.quantity);

                const hongKongMOQ = productInfoFromDB.moq;
                const hongKongUnitPrice = productInfoFromDB.unitPrice;
                const hongKongTotalPrice = (hongKongUnitPrice * product.quantity);

                let rowClass = '';
                if (product.selectedBranch === 'Hong Kong' && product.quantity < hongKongMOQ) {
                    rowClass = 'needs-review';
                } else if (product.selectedBranch === 'Colômbia' && product.quantity > productInfoFromDB.simulatedStock) {
                    rowClass = 'needs-review';
                }

                tableHtml += `
                    <tr class="${rowClass}">
                        <td>${product.clientCode}</td>
                        <td>${product.code}</td>
                        <td>${product.name}</td>
                        <td>${product.quantity}</td>
                        <td class="colombia-col" style="color: ${columbiaStockColor}; font-weight: bold;">${columbiaStockStatus}</td>
                        <td class="colombia-col">R$ ${columbiaUnitPrice.toFixed(2).replace('.', ',')}</td>
                        <td class="colombia-col">R$ ${columbiaTotalPrice.toFixed(2).replace('.', ',')}</td>
                        <td class="hongkong-col">${hongKongMOQ}</td>
                        <td class="hongkong-col">R$ ${hongKongUnitPrice.toFixed(2).replace('.', ',')}</td>
                        <td class="hongkong-col">R$ ${hongKongTotalPrice.toFixed(2).replace('.', ',')}</td>
                        <td>
                            <select onchange="updateProductSelectedBranch(${index}, this.value)">
                                <option value="Colômbia" ${product.selectedBranch === 'Colômbia' ? 'selected' : ''}>Colômbia</option>
                                <option value="Hong Kong" ${product.selectedBranch === 'Hong Kong' ? 'selected' : ''}>Hong Kong</option>
                            </select>
                        </td>
                        <td><button onclick="removeProduct(${index})" class="remove-item-btn">Remover</button></td>
                    </tr>
                `;
            });
            tableHtml += `</tbody></table>`;
            listDiv.innerHTML += tableHtml;
        }

        function submitOrderForm() {
            if (productsInCurrentOrder.length === 0) {
                showMessage('Erro', 'Por favor, adicione pelo menos um produto antes de enviar a solicitação.', 'error');
                return;
            }

            let validationErrors = [];
            productsInCurrentOrder.forEach(product => {
                const productInfoFromDB = productDatabase[product.code];
                if (product.selectedBranch === 'Hong Kong') {
                    if (product.quantity < productInfoFromDB.moq) {
                        validationErrors.push(`O item "${product.name}" (Qtd: ${product.quantity}) não atende ao MOQ mínimo de ${productInfoFromDB.moq} para Hong Kong. Por favor, ajuste a quantidade ou a filial.`);
                    }
                } else if (product.selectedBranch === 'Colômbia') {
                    if (product.quantity > productInfoFromDB.simulatedStock) {
                        validationErrors.push(`A quantidade (${product.quantity}) do item "${product.name}" excede o estoque disponível (${productInfoFromDB.simulatedStock}) na Colômbia. Por favor, ajuste a quantidade ou a filial.`);
                    }
                }
            });

            if (validationErrors.length > 0) {
                showMessage('Erros de Validação', validationErrors.join('<br>'), 'error');
                renderProductList();
                return;
            }

            currentParentOrderId = `SOL-${nextParentRequestCounter.toString().padStart(3, '0')}`;
            nextParentRequestCounter++;

            const productsBySelectedBranch = productsInCurrentOrder.reduce((acc, product) => {
                if (!acc[product.selectedBranch]) {
                    acc[product.selectedBranch] = [];
                }
                acc[product.selectedBranch].push(product);
                return acc;
            }, {});

            simulatedSupplierOrders = {};
            simulatedColombiaOrder = null;

            for (const branch in productsBySelectedBranch) {
                const productsForThisBranch = productsBySelectedBranch[branch];
                if (branch === 'Hong Kong') {
                    submitHongKongFormLogic(productsForThisBranch);
                } else if (branch === 'Colômbia') {
                    submitColombiaFormLogic(productsForThisBranch);
                }
            }
            
            showScreen('summaryScreen');
            renderUnifiedSummary();

            productsInCurrentOrder = [];
            synchronizeOrdersAndPOs();
        }

        function submitHongKongFormLogic(productsForHongKong) {
            let moqMessages = [];
            let validProductsAfterMoq = [];
            
            productsForHongKong.forEach(product => {
                if (product.quantity < product.moq) {
                    moqMessages.push(`🚫 O item "${product.name}" (Qtd: ${product.quantity}) não atende ao MOQ mínimo de ${product.moq}. Este item será cancelado do pedido.`);
                } else {
                    validProductsAfterMoq.push(product);
                }
            });

            if (validProductsAfterMoq.length === 0) {
                if (moqMessages.length > 0) {
                    simulatedSupplierOrders['MOQ_FAILED'] = { messages: moqMessages };
                }
                return;
            }

            const productsBySupplier = validProductsAfterMoq.reduce((acc, product) => {
                if (!acc[product.supplier]) {
                    acc[product.supplier] = [];
                }
                acc[product.supplier].push(product);
                return acc;
            }, {});

            for (const supplierName in productsBySupplier) {
                const productsForThisSupplier = productsBySupplier[supplierName];
                
                const poId = `PED-${nextPurchaseOrderIdCounter.toString().padStart(3, '0')}`;
                nextPurchaseOrderIdCounter++;

                const newPO = {
                    id: poId,
                    parentOrderId: currentParentOrderId,
                    supplier: supplierName,
                    supplierCode: getOrGenerateSupplierCode(supplierName),
                    date: new Date().toISOString().slice(0, 10),
                    products: [],
                    newSupplierPriceTotal: 0,
                    currentInternalPriceTotal: 0,
                    overallApprovalStatus: 'Pendente',
                    originCountry: 'Hong Kong',
                    totalCubage: 0
                };

                productsForThisSupplier.forEach(product => {
                    const productWithSimulatedPrices = { ...product };
                    
                    productWithSimulatedPrices.currentInternalUnitPrice = (product.tableValue + Math.random() * 5).toFixed(2);
                    productWithSimulatedPrices.newSupplierUnitPrice = (product.unitPrice * (1 + (Math.random() * 0.05))).toFixed(2);

                    newPO.products.push(productWithSimulatedPrices);
                    newPO.newSupplierPriceTotal = (parseFloat(newPO.newSupplierPriceTotal) + (parseFloat(productWithSimulatedPrices.newSupplierUnitPrice) * product.quantity)).toFixed(2);
                    newPO.currentInternalPriceTotal = (parseFloat(newPO.currentInternalPriceTotal) + (parseFloat(productWithSimulatedPrices.currentInternalUnitPrice) * product.quantity)).toFixed(2);
                    newPO.totalCubage = (parseFloat(newPO.totalCubage) + (product.cubageUnit * product.quantity));
                });
                newPO.totalCubage = newPO.totalCubage.toFixed(2);

                simulatedSupplierOrders[supplierName] = newPO;
            }
            if (moqMessages.length > 0) {
                simulatedSupplierOrders['MOQ_INFO'] = { messages: moqMessages };
            }
        }

        function submitColombiaFormLogic(productsForColombia) {
            const totalValue = productsForColombia.reduce((sum, product) => sum + (product.tableValue * product.quantity), 0);

            const newOrderId = `SAP-${nextSapOrderIdCounter.toString().padStart(3, '0')}`;
            nextSapOrderIdCounter++;

            simulatedColombiaOrder = {
                orderId: newOrderId,
                parentOrderId: currentParentOrderId,
                clientFlag: currentUserClientName, // Use the current user's client name
                originCountry: 'Colômbia',
                totalValue: totalValue,
                status: 'Em Separação',
                requestDate: new Date().toISOString().slice(0, 10),
                lastUpdateDate: new Date().toISOString().slice(0, 10),
                supplier: productsForColombia[0].supplier,
                products: productsForColombia.map(p => ({
                    code: p.code,
                    description: p.name,
                    quantity: p.quantity,
                    unitPrice: p.tableValue,
                    cubageUnit: p.cubageUnit,
                    totalValue: (p.tableValue * p.quantity).toFixed(2)
                }))
            };
        }

        function renderUnifiedSummary() {
            const unifiedSummaryContentDiv = document.getElementById('unifiedSummaryContent');
            unifiedSummaryContentDiv.innerHTML = '';

            if (Object.keys(simulatedSupplierOrders).length > 0) {
                const hongKongSection = document.createElement('div');
                hongKongSection.className = 'summary-section';
                hongKongSection.innerHTML = `
                    <h2 class="text-xl font-semibold mb-4">Pedidos para Hong Kong</h2>
                `;

                if (simulatedSupplierOrders['MOQ_INFO'] && simulatedSupplierOrders['MOQ_INFO'].messages.length > 0) {
                    const moqValidationDiv = document.createElement('div');
                    moqValidationDiv.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4';
                    moqValidationDiv.innerHTML = `<p class="font-bold">Atenção: Problemas de MOQ detectados!</p>${simulatedSupplierOrders['MOQ_INFO'].messages.map(msg => `<p>${msg}</p>`).join('')}`;
                    hongKongSection.appendChild(moqValidationDiv);
                }
                if (simulatedSupplierOrders['MOQ_FAILED'] && simulatedSupplierOrders['MOQ_FAILED'].messages.length > 0) {
                    const moqFailedDiv = document.createElement('div');
                    moqFailedDiv.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
                    moqFailedDiv.innerHTML = `<p class="font-bold">Erro: Itens cancelados devido a falha no MOQ!</p>${simulatedSupplierOrders['MOQ_FAILED'].messages.map(msg => `<p>${msg}</p>`).join('')}`;
                    hongKongSection.appendChild(moqFailedDiv);
                }

                hongKongSection.innerHTML += `<h3 class="font-semibold text-gray-700 mb-3">Divisão por Fornecedor (Requisições de Compra - POs):</h3>`;

                for (const supplierName in simulatedSupplierOrders) {
                    if (supplierName === 'MOQ_INFO' || supplierName === 'MOQ_FAILED') continue;

                    const po = simulatedSupplierOrders[supplierName];
                    const poDiv = document.createElement('div');
                    poDiv.className = 'supplier-summary-card';

                    const totalCubage = parseFloat(po.totalCubage || 0);
                    const percentageOccupation20HC = (totalCubage / MAX_CUBAGE_20HC) * 100;
                    const percentageOccupation40HC = (totalCubage / MAX_CUBAGE_40HC) * 100;

                    let cardStatusEmoji = '';
                    if (po.overallApprovalStatus === 'Aguardando Aprovação') {
                        cardStatusEmoji = '🟡';
                    } else if (po.overallApprovalStatus === 'Aprovado') {
                        cardStatusEmoji = '🟢';
                    } else if (po.overallApprovalStatus === 'Rejeitado') {
                        cardStatusEmoji = '🔴';
                    } else if (po.overallApprovalStatus === 'Negociado') {
                        cardStatusEmoji = '�';
                    } else if (po.overallApprovalStatus === 'Finalizado') {
                        cardStatusEmoji = '✅';
                    }

                    poDiv.innerHTML = `
                        <span class="supplier-status-indicator">${cardStatusEmoji}</span>
                        <h4 class="font-semibold text-lg mb-2">PO Nº ${po.id} para Fornecedor: <span class="text-blue-700">${po.supplierCode} - ${po.supplier}</span></h4>
                        <p class="text-gray-600 mb-1">ID Solicitação Principal: <strong>${po.parentOrderId}</strong></p>
                        <p class="text-gray-600 mb-1">Data Geração: ${po.date}</p>
                        <p class="text-gray-600 mb-4">Valor Total Pedido (Estimado): <strong>R$ ${parseFloat(po.newSupplierPriceTotal).toFixed(2).replace('.', ',')}</strong></p>
                        
                        <h5 class="font-semibold text-md mb-2">Produtos:</h5>
                        <div class="overflow-x-auto">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Cód Produto</th>
                                        <th>Descrição</th>
                                        <th>Qtd.</th>
                                        <th>Valor Unit. Interno</th>
                                        <th>Valor Unit. Fornecedor (Atual)</th>
                                        <th>M³ Total Item</th>
                                        <th>Status Aprovação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${po.products.map(p => `
                                        <tr>
                                            <td>${p.code}</td>
                                            <td>${p.name}</td>
                                            <td>${p.quantity}</td>
                                            <td>R$ ${parseFloat(p.currentInternalUnitPrice).toFixed(2).replace('.', ',')}</td>
                                            <td>R$ ${parseFloat(p.newSupplierUnitPrice).toFixed(2).replace('.', ',')}</td>
                                            <td>${(p.cubageUnit * p.quantity).toFixed(2).replace('.', ',')} m³</td>
                                            <td class="product-approval-status ${p.approvalStatus}">${p.approvalStatus}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        
                        <h5 class="font-semibold text-md mb-2 mt-4">Previsão de Cubagem por Tipo de Container:</h5>
                        <p class="text-sm text-gray-700 mb-2">Cubagem Total do Pedido: <strong>${totalCubage.toFixed(2).replace('.', ',')} m³</strong></p>
                        <table class="cubage-table">
                            <thead>
                                <tr>
                                    <th>Tipo CTN</th>
                                    <th>% Ocupação</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>LCL</td>
                                    <td>${totalCubage > 0 ? '100.00' : '0.00'}%</td>
                                </tr>
                                <tr>
                                    <td>CTN 20</td>
                                    <td>${percentageOccupation20HC.toFixed(2).replace('.', ',')}%</td>
                                </tr>
                                <tr>
                                    <td>CTN 40HC</td>
                                    <td>${percentageOccupation40HC.toFixed(2).replace('.', ',')}%</td>
                                </tr>
                            </tbody>
                        </table>
                    `;
                    hongKongSection.appendChild(poDiv);
                }
                unifiedSummaryContentDiv.appendChild(hongKongSection);
            }

            if (simulatedColombiaOrder) {
                const colombiaSection = document.createElement('div');
                colombiaSection.className = 'summary-section';
                colombiaSection.innerHTML = `
                    <h2 class="text-xl font-semibold mb-4">Pedido para Colômbia</h2>
                    <div class="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
                        <h3 class="font-semibold text-lg mb-2">Detalhes do Pedido de Venda</h3>
                        <p class="mb-1">Nº Pedido de Venda SAP: <strong>${simulatedColombiaOrder.orderId}</strong></p>
                        <p class="mb-1">ID Solicitação Principal: <strong>${simulatedColombiaOrder.parentOrderId}</strong></p>
                        <p class="mb-1">Valor Total: <strong>R$ ${simulatedColombiaOrder.totalValue.toFixed(2).replace('.', ',')}</strong></p>
                        <h4 class="font-semibold text-md mb-2 mt-4">Produtos:</h4>
                        <div class="overflow-x-auto">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Cód Produto</th>
                                        <th>Descrição</th>
                                        <th>Qtd.</th>
                                        <th>Valor Unit.</th>
                                        <th>Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${simulatedColombiaOrder.products.map(p => `
                                        <tr>
                                            <td>${p.code}</td>
                                            <td>${p.description}</td>
                                            <td>${p.quantity}</td>
                                            <td>R$ ${parseFloat(p.unitPrice).toFixed(2).replace('.', ',')}</td>
                                            <td>R$ ${parseFloat(p.totalValue).toFixed(2).replace('.', ',')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
                unifiedSummaryContentDiv.appendChild(colombiaSection);
            }

            if (Object.keys(simulatedSupplierOrders).length === 0 && !simulatedColombiaOrder) {
                unifiedSummaryContentDiv.innerHTML = '<p class="text-center text-gray-500">Nenhum pedido para exibir no resumo.</p>';
            }
        }

        function generateUnifiedOrders() {
            for (const supplierName in simulatedSupplierOrders) {
                if (supplierName === 'MOQ_INFO' || supplierName === 'MOQ_FAILED') continue;
                const po = simulatedSupplierOrders[supplierName];
                const existingPoIndex = generatedPurchaseOrders.findIndex(existingPo => existingPo.id === po.id);
                if (existingPoIndex === -1) {
                    generatedPurchaseOrders.push(po);
                } else {
                    generatedPurchaseOrders[existingPoIndex] = po;
                }

                const orderInMainList = orders.find(o => o.orderId === po.id);
                if (!orderInMainList) {
                    orders.push({
                        orderId: po.id,
                        parentOrderId: po.parentOrderId,
                        clientFlag: currentUserClientName,
                        originCountry: po.originCountry,
                        totalValue: parseFloat(po.newSupplierPriceTotal),
                        status: po.overallApprovalStatus,
                        requestDate: po.date,
                        lastUpdateDate: new Date().toISOString().slice(0, 10),
                        supplier: po.supplier,
                        products: po.products.map(p => ({
                            code: p.code,
                            description: p.name,
                            quantity: p.quantity,
                            unitPrice: parseFloat(p.newSupplierUnitPrice),
                            cubageUnit: p.cubageUnit
                        }))
                    });
                } else {
                    orderInMainList.status = po.overallApprovalStatus;
                    orderInMainList.lastUpdateDate = new Date().toISOString().slice(0, 10);
                }
            }

            if (simulatedColombiaOrder) {
                const existingColombiaOrderIndex = generatedPurchaseOrders.findIndex(existingPo => existingPo.id === simulatedColombiaOrder.orderId);
                if (existingColombiaOrderIndex === -1) {
                    generatedPurchaseOrders.push(simulatedColombiaOrder);
                } else {
                    generatedPurchaseOrders[existingColombiaOrderIndex] = simulatedColombiaOrder;
                }

                const orderInMainList = orders.find(o => o.orderId === simulatedColombiaOrder.orderId);
                if (!orderInMainList) {
                    orders.push(simulatedColombiaOrder);
                } else {
                    orderInMainList.status = simulatedColombiaOrder.status;
                    orderInMainList.lastUpdateDate = new Date().toISOString().slice(0, 10);
                }
            }

            showMessage('Solicitação Enviada', 'Sua solicitação foi processada e os pedidos foram gerados. Você pode acompanhar o status na Central de Pedidos.', 'success', () => backToOrderCenter());

            simulatedSupplierOrders = {};
            simulatedColombiaOrder = null;
            synchronizeOrdersAndPOs();
        }

        function showNfePdfUnified() {
            if (simulatedColombiaOrder && simulatedColombiaOrder.nfeContent) {
                document.getElementById('nfePdfContent').innerText = simulatedColombiaOrder.nfeContent;
                document.getElementById('nfePdfViewer').classList.add('active');
            } else {
                showMessage('Erro', 'Conteúdo da NF-e não disponível.', 'error');
            }
        }

        function renderPOTable(tbodyId, filteredPOs, actionButtonText, actionButtonFunction) {
            const tbody = document.getElementById(tbodyId);
            if (!tbody) {
                console.error(`Error: tbody with ID '${tbodyId}' not found.`);
                return;
            }
            tbody.innerHTML = '';

            if (filteredPOs.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-gray-500">Nenhum pedido encontrado.</td></tr>`;
                return;
            }

            filteredPOs.forEach(po => {
                const row = document.createElement('tr');
                const orderInMainList = orders.find(o => o.orderId === po.id);
                const clientName = orderInMainList ? orderInMainList.clientFlag : 'Cliente Desconhecido'; // Ensured no N/A
                const supplierName = po.supplier || 'N/A';
                const lastUpdateDate = orderInMainList ? orderInMainList.lastUpdateDate : po.date;
                
                let statusIndicatorClass = '';
                switch (po.overallApprovalStatus) {
                    case 'Pendente':
                    case 'Aguardando Aprovação':
                    case 'Em Negociação':
                        statusIndicatorClass = 'yellow';
                        break;
                    case 'Aprovado':
                    case 'Finalizado':
                        statusIndicatorClass = 'green';
                        break;
                    case 'Rejeitado':
                        statusIndicatorClass = 'red';
                        break;
                    case 'Negociado':
                        statusIndicatorClass = 'purple';
                        break;
                    default:
                        statusIndicatorClass = 'gray';
                }

                let actionButtonHtml = '';
                if (actionButtonFunction) {
                    actionButtonHtml = `<button onclick="${actionButtonFunction}('${po.id}')" class="btn btn-primary btn-sm">${actionButtonText}</button>`;
                }

                row.innerHTML = `
                    <td>${po.parentOrderId || 'N/A'}</td>
                    <td>${po.id}</td>
                    <td>${clientName}</td>
                    <td>${supplierName}</td>
                    <td>R$ ${parseFloat(po.newSupplierPriceTotal).toFixed(2).replace('.', ',')}</td>
                    <td>${lastUpdateDate}</td>
                    <td><span class="status-indicator ${statusIndicatorClass}"></span>${po.overallApprovalStatus}</td>
                    <td>${actionButtonHtml}</td>
                `;
                tbody.appendChild(row);
            });
        }

        function renderPurchasingCenterTables() {
            const novasSolicitacoesPOs = generatedPurchaseOrders.filter(po => po.overallApprovalStatus === 'Pendente');
            renderPOTable('negotiationTable', novasSolicitacoesPOs, 'Visualizar', 'viewPurchasingOrderDetails');

            const negotiationInProgressPOs = generatedPurchaseOrders.filter(po => po.overallApprovalStatus === 'Negociado');
            renderPOTable('negotiationInProgressTable', negotiationInProgressPOs, 'Visualizar', 'viewPurchasingOrderDetails');

            const pendenteGerenciaPOs = generatedPurchaseOrders.filter(po =>
                po.overallApprovalStatus === 'Aguardando Aprovação' || po.overallApprovalStatus === 'Rejeitado'
            );
            renderPOTable('pendenteGerenciaTable', pendenteGerenciaPOs, 'Visualizar', 'viewPurchasingOrderDetails');

            const aprovadoGerenciaPOs = generatedPurchaseOrders.filter(po =>
                po.overallApprovalStatus === 'Aprovado' || po.overallApprovalStatus === 'Finalizado'
            );
            renderPOTable('aprovadoGerenciaTable', aprovadoGerenciaPOs, 'Visualizar', 'viewPurchasingOrderDetails');
        }

        function viewPurchasingOrderDetails(poId) {
            currentPurchasingPO = generatedPurchaseOrders.find(po => po.id === poId);
            if (!currentPurchasingPO) {
                showMessage('Erro', 'Detalhes do pedido de compra não encontrados.', 'error');
                return;
            }

            document.getElementById('purchasingCurrentOrderId').innerText = currentPurchasingPO.id;
            document.getElementById('purchasingDetailOrderId').innerText = currentPurchasingPO.id;
            document.getElementById('purchasingDetailParentOrderId').innerText = currentPurchasingPO.parentOrderId || 'N/A';
            document.getElementById('purchasingDetailSupplier').innerText = `${currentPurchasingPO.supplierCode} - ${currentPurchasingPO.supplier}`;
            document.getElementById('purchasingDetailStatus').innerText = currentPurchasingPO.overallApprovalStatus;
            document.getElementById('purchasingDetailDate').innerText = currentPurchasingPO.date;

            const productsTableBody = document.getElementById('purchasingOrderProductsTableBody');
            productsTableBody.innerHTML = '';

            currentPurchasingPO.products.forEach(product => {
                const row = document.createElement('tr');
                const newSupplierUnitPrice = parseFloat(product.newSupplierUnitPrice || 0).toFixed(2).replace('.', ',');
                
                const isEditable = currentPurchasingPO.overallApprovalStatus !== 'Aprovado' && currentPurchasingPO.overallApprovalStatus !== 'Finalizado';
                const inputHtml = isEditable ? 
                    `<input type="number" step="0.01" value="${parseFloat(product.newSupplierUnitPrice).toFixed(2)}"
                            oninput="updateProductNewPrice('${product.code}', this.value)"
                            class="product-quantity-input !w-full !text-right">` :
                    `R$ ${newSupplierUnitPrice}`;

                row.innerHTML = `
                    <td>${product.code}</td>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>R$ ${parseFloat(product.currentInternalUnitPrice).toFixed(2).replace('.', ',')}</td>
                    <td>R$ ${newSupplierUnitPrice}</td>
                    <td>${inputHtml}</td>
                    <td class="product-approval-status ${product.approvalStatus}">${product.approvalStatus}</td>
                `;
                productsTableBody.appendChild(row);
            });

            const saveBtn = document.getElementById('savePurchasingNegotiationBtn');
            if (currentPurchasingPO.overallApprovalStatus === 'Negociado' || currentPurchasingPO.overallApprovalStatus === 'Aguardando Aprovação' || currentPurchasingPO.overallApprovalStatus === 'Rejeitado') {
                saveBtn.innerText = 'Solicitar Aprovação';
            } else if (currentPurchasingPO.overallApprovalStatus === 'Aprovado') {
                saveBtn.innerText = 'Finalizar Processo';
            }
            else {
                saveBtn.innerText = 'Salvar Negociação';
            }
            showScreen('purchasingOrderDetailsScreen');
        }

        function updateProductNewPrice(productCode, newValue) {
            const product = currentPurchasingPO.products.find(p => p.code === productCode);
            if (product) {
                product.newSupplierUnitPrice = parseFloat(newValue).toFixed(2);
                currentPurchasingPO.newSupplierPriceTotal = currentPurchasingPO.products.reduce((sum, p) =>
                    sum + (parseFloat(p.newSupplierUnitPrice) * p.quantity), 0
                ).toFixed(2);
            }
        }

        function handlePurchasingAction() {
            const saveBtn = document.getElementById('savePurchasingNegotiationBtn');
            const currentAction = saveBtn.innerText;

            if (!currentPurchasingPO) {
                showMessage('Erro', 'Nenhum pedido de compra selecionado para ação.', 'error');
                return;
            }

            if (currentAction === 'Salvar Negociação') {
                currentPurchasingPO.overallApprovalStatus = 'Negociado';
                showMessage('Sucesso', `Negociação para o pedido ${currentPurchasingPO.id} salva com sucesso! O pedido está agora em "Negociações em Andamento".`, 'success');
            } else if (currentAction === 'Solicitar Aprovação') {
                currentPurchasingPO.overallApprovalStatus = 'Aguardando Aprovação';
                showMessage('Sucesso', `Solicitação de aprovação para o pedido ${currentPurchasingPO.id} enviada à Gerência.`, 'success');
            } else if (currentAction === 'Finalizar Processo') {
                currentPurchasingPO.overallApprovalStatus = 'Finalizado';
                showMessage('Sucesso', `Processo para o pedido ${currentPurchasingPO.id} finalizado por Compras.`, 'success');
                const orderInMainList = orders.find(o => o.orderId === currentPurchasingPO.id);
                if (orderInMainList && orderInMainList.status === 'Aprovado') {
                    orderInMainList.status = 'Finalizado';
                }
            }

            const mainOrderIndex = orders.findIndex(order => order.orderId === currentPurchasingPO.id);
            if (mainOrderIndex !== -1) {
                orders[mainOrderIndex].status = currentPurchasingPO.overallApprovalStatus;
                orders[mainOrderIndex].lastUpdateDate = new Date().toISOString().slice(0, 10);
            }
            backToPurchasingCenter();
        }

        function generatePOPDF() {
            if (!currentPurchasingPO) {
                showMessage('Erro', 'Nenhum pedido de compra selecionado para gerar PDF.', 'error');
                return;
            }

            const poPdfContentDiv = document.getElementById('poPdfContent');
            const poPdfViewerDiv = document.getElementById('poPdfViewer');

            let productListHtml = currentPurchasingPO.products.map(p => `
                - ${p.name} (${p.code})
                  Quantidade: ${p.quantity}
                  Valor Unit. Interno: R$ ${parseFloat(p.currentInternalUnitPrice).toFixed(2).replace('.', ',')}
                  Valor Unit. Fornecedor: R$ ${parseFloat(p.newSupplierUnitPrice).toFixed(2).replace('.', ',')}
                  Status Aprovação: ${p.approvalStatus}
            `).join('\n\n');

            poPdfContentDiv.innerText = `
                PURCHASE ORDER (PO)
                ----------------------------------------------------
                PO Nº: ${currentPurchasingPO.id}
                ID Solicitação Principal: ${currentPurchasingPO.parentOrderId || 'N/A'}
                Data de Emissão: ${currentPurchasingPO.date}

                Fornecedor:
                ${currentPurchasingPO.supplierCode} - ${currentPurchasingPO.supplier}
                Endereço: [Endereço do Fornecedor]
                Cidade: [Cidade do Fornecedor]

                Produtos:
                ${productListHtml}

                Valor Total Estimado (Fornecedor): R$ ${parseFloat(currentPurchasingPO.newSupplierPriceTotal).toFixed(2).replace('.', ',')}
                Valor Total Interno Estimado: R$ ${parseFloat(currentPurchasingPO.currentInternalPriceTotal).toFixed(2).replace('.', ',')}
                
                Status de Aprovação Geral: ${currentPurchasingPO.overallApprovalStatus}

                Observações: Documento gerado automaticamente.
                ----------------------------------------------------
            `;
            poPdfViewerDiv.classList.add('active');
        }

        function simulateRenatoApprovalScreen() {
            showScreen('renatoApprovalScreen');
            switchRenatoApprovalTab('pendingApproval');
        }

        function renderPendingRenatoApprovalList() {
            const pendingForRenato = generatedPurchaseOrders.filter(po =>
                po.overallApprovalStatus === 'Aguardando Aprovação'
            ).sort((a, b) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                return a.id.localeCompare(b.id);
            });
            renderPOTable('pendingOrdersTableBody', pendingForRenato, 'Visualizar', 'viewDetailedApproval');
        }

        function renderRejectedRenatoApprovalList() {
            const rejectedForRenato = generatedPurchaseOrders.filter(po =>
                po.overallApprovalStatus === 'Rejeitado'
            ).sort((a, b) => {
                if (a.date > b.date) return 1;
                if (a.date < b.date) return -1;
                return a.id.localeCompare(b.id);
            });
            renderPOTable('rejectedOrdersTableBody', rejectedForRenato, 'Visualizar', 'viewDetailedApproval');
        }

        function viewDetailedApproval(poId) {
            document.getElementById('analysisLoadingScreen').classList.add('active');

            setTimeout(() => {
                document.getElementById('analysisLoadingScreen').classList.remove('active');

                currentViewingPO = generatedPurchaseOrders.find(po => po.id === poId);
                if (!currentViewingPO) {
                    showMessage('Erro', 'Detalhes do pedido de compra não encontrados.', 'error');
                    return;
                }

                const pendingApprovalTab = document.getElementById('pendingApprovalTab');
                const rejectedOrdersTab = document.getElementById('rejectedOrdersTab');
                const detailedApprovalViewDiv = document.getElementById('detailedApprovalView');
                const renatoApprovalTabButtons = document.getElementById('renatoApprovalTabButtons');

                if (pendingApprovalTab) {
                    pendingApprovalTab.classList.add('hidden');
                }
                if (rejectedOrdersTab) {
                    rejectedOrdersTab.classList.add('hidden');
                }
                if (renatoApprovalTabButtons) {
                    renatoApprovalTabButtons.classList.add('hidden');
                }

                if (detailedApprovalViewDiv) {
                    detailedApprovalViewDiv.classList.remove('hidden');
                }

                document.getElementById('currentDetailedParentOrderIdDisplay').innerText = currentViewingPO.parentOrderId || currentViewingPO.id;

                renderSupplierApprovalCards();
                updateGlobalDifferenceSummary();
                checkApprovalButtonsState();
            }, 2000);
        }

        function backToPendingOrdersList() {
            document.getElementById('detailedApprovalView').classList.add('hidden');
            const pendingApprovalTab = document.getElementById('pendingApprovalTab');
            const rejectedOrdersTab = document.getElementById('rejectedOrdersTab');
            const renatoApprovalTabButtons = document.getElementById('renatoApprovalTabButtons');

            if (pendingApprovalTab) {
                pendingApprovalTab.classList.remove('hidden');
            }
            if (rejectedOrdersTab) {
                rejectedOrdersTab.classList.remove('hidden');
            }
            if (renatoApprovalTabButtons) {
                renatoApprovalTabButtons.classList.remove('hidden');
            }
            switchRenatoApprovalTab('pendingApproval'); // Go back to the pending tab
        }

        function renderSupplierApprovalCards() {
            const cardsDiv = document.getElementById('supplierApprovalCards');
            cardsDiv.innerHTML = '';

            const po = currentViewingPO;
            const card = document.createElement('div');
            card.className = 'supplier-summary-card';

            const totalExternalCost = parseFloat(po.newSupplierPriceTotal);
            const totalCubage = parseFloat(po.totalCubage || 0);
            const percentageOccupation20HC = (totalCubage / MAX_CUBAGE_20HC) * 100;
            const percentageOccupation40HC = (totalCubage / MAX_CUBAGE_40HC) * 100;
            
            let cardStatusEmoji = '';
            if (po.overallApprovalStatus === 'Aguardando Aprovação') {
                cardStatusEmoji = '🟡';
            } else if (po.overallApprovalStatus === 'Aprovado') {
                cardStatusEmoji = '🟢';
            } else if (po.overallApprovalStatus === 'Rejeitado') {
                cardStatusEmoji = '🔴';
            } else if (po.overallApprovalStatus === 'Negociado') {
                cardStatusEmoji = '🟣';
            } else if (po.overallApprovalStatus === 'Finalizado') {
                cardStatusEmoji = '✅';
            }

            card.innerHTML = `
                <span class="supplier-status-indicator">${cardStatusEmoji}</span>
                <h3 class="font-semibold text-lg mb-2">PO Nº ${po.id} para Fornecedor: <span class="text-blue-700">${po.supplierCode} - ${po.supplier}</span></h3>
                <p class="text-gray-600 mb-1">ID Solicitação Principal: <strong>${po.parentOrderId}</strong></p>
                <p class="text-gray-600 mb-1">Data Geração: ${po.date}</p>
                <p class="text-gray-600 mb-4">Valor Total Pedido (Estimado): <strong>R$ ${totalExternalCost.toFixed(2).replace('.', ',')}</strong></p>
                
                <h5 class="font-semibold text-md mb-2 mt-4">Previsão de Cubagem por Tipo de Container:</h5>
                <p class="text-sm text-gray-700 mb-2">Cubagem Total do Pedido: <strong>${totalCubage.toFixed(2).replace('.', ',')} m³</strong></p>
                <table class="cubage-table">
                    <thead>
                        <tr>
                            <th>Tipo CTN</th>
                            <th>% Ocupação</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>LCL</td>
                            <td>${totalCubage > 0 ? '100.00' : '0.00'}%</td>
                        </tr>
                        <tr>
                            <td>CTN 20</td>
                            <td>${percentageOccupation20HC.toFixed(2).replace('.', ',')}%</td>
                        </tr>
                        <tr>
                            <td>CTN 40HC</td>
                            <td>${percentageOccupation40HC.toFixed(2).replace('.', ',')}%</td>
                        </tr>
                    </tbody>
                </table>

                <h4 class="font-semibold text-md mb-2">Detalhes dos Produtos:</h4>
                <div class="overflow-x-auto">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Cód Produto</th>
                                <th>Descrição</th>
                                <th>Qtd.</th>
                                <th>Valor Unit. Interno</th>
                                <th>Valor Unit. Fornecedor</th>
                                <th>Dif</th>
                                <th>Valor Total Interno</th>
                                <th>Valor Total Fornecedor</th>
                                <th>Status Aprovação</th>
                                <th>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${po.products.map((p, pIndex) => {
                                const diff = parseFloat(p.newSupplierUnitPrice) - parseFloat(p.currentInternalUnitPrice);
                                const percent = parseFloat(p.currentInternalUnitPrice) === 0
                                    ? 0
                                    : (diff / parseFloat(p.currentInternalUnitPrice)) * 100;
                                const diffClass = diff > 0 ? 'price-difference-positive' : (diff < 0 ? 'price-difference-negative' : '');
                                const diffText = diff > 0
                                    ? `+R$ ${diff.toFixed(2).replace('.', ',')} (+${percent.toFixed(2)}%)`
                                    : diff < 0
                                        ? `-R$ ${Math.abs(diff).toFixed(2).replace('.', ',')} (${percent.toFixed(2)}%)`
                                        : 'R$ 0,00 (0,00%)';
                                const totalInterno = parseFloat(p.currentInternalUnitPrice) * p.quantity;
                                const totalFornecedor = parseFloat(p.newSupplierUnitPrice) * p.quantity;
                                return `
                                    <tr>
                                        <td>${p.code}</td>
                                        <td>${p.name}</td>
                                        <td>${p.quantity}</td>
                                        <td>R$ ${parseFloat(p.currentInternalUnitPrice).toFixed(2).replace('.', ',')}</td>
                                        <td>R$ ${parseFloat(p.newSupplierUnitPrice).toFixed(2).replace('.', ',')}</td>
                                        <td><span class="${diffClass}">${diffText}</span></td>
                                        <td>R$ ${totalInterno.toFixed(2).replace('.', ',')}</td>
                                        <td>R$ ${totalFornecedor.toFixed(2).replace('.', ',')}</td>
                                        <td class="product-approval-status ${p.approvalStatus}">${p.approvalStatus}</td>
                                        <td>
                                            <div class="approval-buttons-group">
                                                <button class="btn btn-sm btn-approve ${p.approvalStatus === 'Aprovado' ? 'selected' : ''}"
                                                        onclick="setProductApprovalStatus('${po.id}', '${p.code}', 'Aprovado')">Aprovar</button>
                                                <button class="btn btn-sm btn-negotiate ${p.approvalStatus === 'Negociar' ? 'selected' : ''}"
                                                        onclick="setProductApprovalStatus('${po.id}', '${p.code}', 'Negociar')">Negociar</button>
                                                <button class="btn btn-sm btn-reject ${p.approvalStatus === 'Rejeitar' ? 'selected' : ''}"
                                                        onclick="setProductApprovalStatus('${po.id}', '${p.code}', 'Rejeitar')">Rejeitar</button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            cardsDiv.appendChild(card);
        }

        function setProductApprovalStatus(poId, productCode, status) {
            const po = generatedPurchaseOrders.find(p => p.id === poId);
            if (po) {
                const product = po.products.find(prod => prod.code === productCode);
                if (product) {
                    product.approvalStatus = status;
                    renderSupplierApprovalCards();
                    checkApprovalButtonsState();
                }
            }
        }

        function checkApprovalButtonsState() {
            const saveApprovalBtn = document.getElementById('saveApprovalBtn');
            const finalizeApprovalBtn = document.getElementById('finalizeApprovalBtn');

            const allProductsReviewed = currentViewingPO.products.every(p => p.approvalStatus !== 'Pendente');

            if (allProductsReviewed) {
                saveApprovalBtn.classList.remove('hidden');
                saveApprovalBtn.disabled = false;
                finalizeApprovalBtn.classList.remove('hidden');
                finalizeApprovalBtn.disabled = false;
            } else {
                saveApprovalBtn.classList.add('hidden');
                saveApprovalBtn.disabled = true;
                finalizeApprovalBtn.classList.add('hidden');
                finalizeApprovalBtn.disabled = true;
            }
        }

        function updateGlobalDifferenceSummary() {
            const globalDifferenceSummaryDiv = document.getElementById('globalDifferenceSummary');
            const globalDifferenceValueSpan = document.getElementById('globalDifferenceValue');

            let totalApprovedDifference = 0;
            let totalNegotiateDifference = 0;
            let totalRejectedDifference = 0;

            currentViewingPO.products.forEach(product => {
                const currentInternalPrice = parseFloat(product.currentInternalUnitPrice);
                const newSupplierPrice = parseFloat(product.newSupplierUnitPrice);
                const difference = (newSupplierPrice - currentInternalPrice) * product.quantity;

                if (product.approvalStatus === 'Aprovado') {
                    totalApprovedDifference += difference;
                } else if (product.approvalStatus === 'Negociar') {
                    totalNegotiateDifference += difference;
                } else if (product.approvalStatus === 'Rejeitar') {
                    totalRejectedDifference += difference;
                }
            });

            const overallDifference = totalApprovedDifference + totalNegotiateDifference + totalRejectedDifference;

            let differenceText = '';
            let differenceClass = '';

            if (overallDifference > 0) {
                differenceText = `Custo Maior: R$ ${overallDifference.toFixed(2).replace('.', ',')}`;
                differenceClass = 'price-difference-positive';
            } else if (overallDifference < 0) {
                differenceText = `Economia: R$ ${Math.abs(overallDifference).toFixed(2).replace('.', ',')}`;
                differenceClass = 'price-difference-negative';
            } else {
                differenceText = `Sem alteração de custo: R$ ${overallDifference.toFixed(2).replace('.', ',')}`;
                differenceClass = '';
            }

            globalDifferenceValueSpan.innerText = differenceText;
            globalDifferenceValueSpan.className = differenceClass;
            globalDifferenceSummaryDiv.classList.remove('hidden');
        }

        function saveApprovalDecisions() {
            showMessage('Sucesso', 'Decisões de aprovação salvas temporariamente. Finalize para aplicar as alterações.', 'success');
        }

        function displayRenatoFinalSummary() {
            if (!currentViewingPO) {
                showMessage('Erro', 'Nenhum pedido selecionado para finalizar aprovação.', 'error');
                return;
            }

            const allProductsReviewed = currentViewingPO.products.every(p => p.approvalStatus !== 'Pendente');
            if (!allProductsReviewed) {
                showMessage('Atenção', 'Por favor, defina o status (Aprovar, Negociar ou Rejeitar) para TODOS os produtos antes de finalizar.', 'warning');
                return;
            }

            let approvedCount = 0;
            let negotiateCount = 0;
            let rejectedCount = 0;
            let totalProducts = currentViewingPO.products.length;

            currentViewingPO.products.forEach(p => {
                if (p.approvalStatus === 'Aprovado') approvedCount++;
                else if (p.approvalStatus === 'Negociar') negotiateCount++;
                else if (p.approvalStatus === 'Rejeitar') rejectedCount++;
            });

            let finalTitle = '';
            let finalMessage = '';
            let finalDetailsHtml = '';

            if (approvedCount === totalProducts) {
                currentViewingPO.overallApprovalStatus = 'Aprovado';
                finalTitle = 'Aprovação Concluída!';
                finalMessage = `Todos os ${totalProducts} produtos do pedido ${currentViewingPO.id} foram APROVADOS pela Gerência.`;
                finalDetailsHtml = `<p>O pedido foi aprovado e agora o processo segue para a equipe de Compras.</p>`;
            } else if (rejectedCount === totalProducts) {
                currentViewingPO.overallApprovalStatus = 'Rejeitado';
                finalTitle = 'Pedido Rejeitado';
                finalMessage = `Todos os ${totalProducts} produtos do pedido ${currentViewingPO.id} foram REJEITADOS pela Gerência.`;
                finalDetailsHtml = `<p>O pedido foi rejeitado e o processo será encerrado.</p>`;
            } else if (negotiateCount > 0 || rejectedCount > 0) {
                currentViewingPO.overallApprovalStatus = 'Em Negociação';
                finalTitle = 'Aprovação com Pendências';
                finalMessage = `O pedido ${currentViewingPO.id} foi parcialmente aprovado ou possui itens para renegociação/rejeição.`;
                finalDetailsHtml = `
                    <p>${approvedCount} produto(s) aprovado(s).</p>
                    <p>${negotiateCount} produto(s) para renegociação.</p>
                    <p>${rejectedCount} produto(s) rejeitado(s).</p>
                    <p class="mt-4">O pedido retornará para a Central de Compras para que as renegociações e/ou rejeições sejam tratadas.</p>
                `;
            } else {
                showMessage('Erro', 'Status de aprovação inconsistente. Por favor, verifique e tente novamente.', 'error');
                return;
            }

            const orderInMainList = orders.find(o => o.orderId === currentViewingPO.id);
            if (orderInMainList) {
                orderInMainList.status = currentViewingPO.overallApprovalStatus;
                orderInMainList.lastUpdateDate = new Date().toISOString().slice(0, 10);
            }

            document.getElementById('hongKongFinalTitle').innerText = finalTitle;
            document.getElementById('hongKongFinalMessage').innerText = finalMessage;
            document.getElementById('finalDetailsHK').innerHTML = finalDetailsHtml;

            showScreen('hongKongFinalScreen');

            currentViewingPO = null;

            synchronizeOrdersAndPOs();
        }

        function synchronizeOrdersAndPOs() {
            orders.forEach(order => {
                const correspondingPO = generatedPurchaseOrders.find(po => po.id === order.orderId);
                if (correspondingPO) {
                    order.status = correspondingPO.overallApprovalStatus;
                    order.lastUpdateDate = new Date().toISOString().slice(0, 10);

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
            if (currentScreen === 'central-pedidos-page') {
                renderOrdersTable();
            } else if (currentScreen === 'purchasingCenterScreen') {
                renderPurchasingCenterTables();
            } else if (currentScreen === 'renatoApprovalScreen') {
                const activeTabButton = document.querySelector('#renatoApprovalTabButtons .tab-button.active');
                if (activeTabButton) {
                    switchRenatoApprovalTab(activeTabButton.onclick.toString().match(/switchRenatoApprovalTab\('(\w+)'\)/)[1]);
                } else {
                    switchRenatoApprovalTab('pendingApproval');
                }
            }
        }

        function toggleCollapsible(headerElement, contentId) {
            const content = document.getElementById(contentId);
            const arrow = headerElement.querySelector('.arrow');
            if (content.classList.contains('active')) {
                content.classList.remove('active');
                headerElement.classList.remove('active');
                if (arrow) arrow.style.transform = 'rotate(0deg)';
            } else {
                content.classList.add('active');
                headerElement.classList.add('active');
                if (arrow) arrow.style.transform = 'rotate(180deg)';
            }
        }

        function openProductCatalogModal() {
            const productCatalogList = document.getElementById('productCatalogList');
            productCatalogList.innerHTML = '';

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

            document.getElementById('productCatalogSearchInput').value = '';
            document.getElementById('productCatalogModal').classList.add('active');
        }

        function filterProductCatalog() {
            const searchTerm = document.getElementById('productCatalogSearchInput').value.toLowerCase();
            const rows = document.querySelectorAll('#productCatalogList tbody tr');

            rows.forEach(row => {
                const clientCode = row.children[0].innerText.toLowerCase();
                const productCode = row.children[1].innerText.toLowerCase();
                const description = row.children[2].innerText.toLowerCase();
                const branch = row.children[3].innerText.toLowerCase();

                if (clientCode.includes(searchTerm) || productCode.includes(searchTerm) || description.includes(searchTerm) || branch.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        function selectProductFromCatalog(clientProductCode) {
            document.getElementById('clientProductCode').value = clientProductCode;
            updateProductDetailsOnClientCodeChange();
            closeProductCatalogModal();
        }

        function handleFileUpload() {
            const fileInput = document.getElementById('fileUpload');
            const fileNameDisplay = document.getElementById('fileNameDisplay');
            const file = fileInput.files[0];
            const maxFileSize = 5 * 1024 * 1024;

            if (!file) {
                displayAddProductMessage('Por favor, selecione um arquivo para upload.', 'error');
                return;
            }

            const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel', 'text/csv'];
            if (!allowedTypes.includes(file.type)) {
                displayAddProductMessage('Tipo de arquivo inválido. Por favor, selecione um arquivo Excel (.xlsx, .xls) ou CSV.', 'error');
                fileInput.value = '';
                fileNameDisplay.innerText = 'Nenhum arquivo selecionado';
                return;
            }

            if (file.size > maxFileSize) {
                displayAddProductMessage('O arquivo excede o tamanho máximo permitido de 5MB.', 'error');
                fileInput.value = '';
                fileNameDisplay.innerText = 'Nenhum arquivo selecionado';
                return;
            }
            
            const dummyProducts = [
                { clientCode: "SKU-001", quantity: 5 },
                { clientCode: "SKU-003", quantity: 10 },
                { clientCode: "SKU-007", quantity: 1 }
            ];

            let productsAddedCount = 0;
            let productsSkippedCount = 0;
            let messages = [];

            dummyProducts.forEach(item => {
                const productCode = universalClientCodeToProductCodeMap[item.clientCode.toUpperCase()];
                const productInfo = productDatabase[productCode];

                if (productInfo) {
                    const existingProductIndex = productsInCurrentOrder.findIndex(p => p.code === productCode);
                    const totalM3 = (productInfo.cubageUnit * item.quantity).toFixed(2);
                    const totalValue = (productInfo.tableValue * item.quantity).toFixed(2);

                    if (existingProductIndex > -1) {
                        productsInCurrentOrder[existingProductIndex].quantity += item.quantity;
                        productsInCurrentOrder[existingProductIndex].totalM3 = (productInfo.cubageUnit * productsInCurrentOrder[existingProductIndex].quantity).toFixed(2);
                        productsInCurrentOrder[existingProductIndex].totalValue = (productInfo.tableValue * productsInCurrentOrder[existingProductIndex].quantity).toFixed(2);
                        messages.push(`Quantidade de "${productInfo.description}" atualizada para ${productsInCurrentOrder[existingProductIndex].quantity}.`);
                    } else {
                        productsInCurrentOrder.push({
                            clientCode: item.clientCode,
                            code: productCode,
                            name: productInfo.description,
                            quantity: item.quantity,
                            moq: productInfo.moq,
                            unitPrice: productInfo.unitPrice,
                            tableValue: productInfo.tableValue,
                            cubageUnit: productInfo.cubageUnit,
                            totalM3: totalM3,
                            totalValue: totalValue,
                            supplier: productInfo.supplier,
                            simulatedStock: productInfo.simulatedStock,
                            originCountry: productInfo.originCountry,
                            selectedBranch: productInfo.originCountry
                        });
                        productsAddedCount++;
                        messages.push(`"${productInfo.description}" adicionado.`);
                    }
                } else {
                    messages.push(`Produto com código de cliente "${item.clientCode}" não encontrado e foi ignorado.`);
                    productsSkippedCount++;
                }
            });

            renderProductList();
            fileInput.value = '';
            fileNameDisplay.innerText = 'Nenhum arquivo selecionado';

            let finalMessage = `Upload de "${file.name}" concluído! ${productsAddedCount} produto(s) adicionado(s).`;
            if (productsSkippedCount > 0) {
                finalMessage += ` ${productsSkippedCount} item(ns) ignorado(s).`;
            }
            displayAddProductMessage(messages.join('<br>') || finalMessage, productsSkippedCount > 0 ? 'warning' : 'success');
        }

        function displayFileName(inputId, displayId) {
            const fileInput = document.getElementById(inputId);
            const fileNameDisplay = document.getElementById(displayId);
            if (fileInput.files.length > 0) {
                fileNameDisplay.innerText = fileInput.files[0].name;
            } else {
                fileNameDisplay.innerText = 'Nenhum arquivo selecionado';
            }
        }

        function processPastedCodes() {
            const pasteCodesTextarea = document.getElementById('pasteCodes');
            const pastedText = pasteCodesTextarea.value.trim();

            if (!pastedText) {
                displayAddProductMessage('Por favor, cole os códigos e quantidades na caixa de texto.', 'error');
                return;
            }

            const normalizedText = pastedText.replace(/\n/g, ';');
            const items = normalizedText.split(';').map(item => item.trim()).filter(item => item !== '');
            
            let productsAddedCount = 0;
            let productsSkippedCount = 0;
            let messages = [];

            items.forEach(itemString => {
                const parts = itemString.split(',');
                if (parts.length === 2) {
                    const clientCode = parts[0].trim().toUpperCase();
                    const quantity = parseInt(parts[1].trim());

                    const productCode = universalClientCodeToProductCodeMap[clientCode];
                    const productInfo = productDatabase[productCode];

                    if (productInfo && !isNaN(quantity) && quantity > 0) {
                        const existingProductIndex = productsInCurrentOrder.findIndex(p => p.code === productCode);
                        const totalM3 = (productInfo.cubageUnit * quantity).toFixed(2);
                        const totalValue = (productInfo.tableValue * quantity).toFixed(2);

                        if (existingProductIndex > -1) {
                            productsInCurrentOrder[existingProductIndex].quantity += quantity;
                            productsInCurrentOrder[existingProductIndex].totalM3 = (productInfo.cubageUnit * productsInCurrentOrder[existingProductIndex].quantity).toFixed(2);
                            productsInCurrentOrder[existingProductIndex].totalValue = (productInfo.tableValue * productsInCurrentOrder[existingProductIndex].quantity).toFixed(2);
                            messages.push(`Quantidade de "${productInfo.description}" atualizada para ${productsInCurrentOrder[existingProductIndex].quantity}.`);
                        } else {
                            productsInCurrentOrder.push({
                                clientCode: clientCode,
                                code: productCode,
                                name: productInfo.description,
                                quantity: quantity,
                                moq: productInfo.moq,
                                unitPrice: productInfo.unitPrice,
                                tableValue: productInfo.tableValue,
                                cubageUnit: productInfo.cubageUnit,
                                totalM3: totalM3,
                                totalValue: totalValue,
                                supplier: productInfo.supplier,
                                simulatedStock: productInfo.simulatedStock,
                                originCountry: productInfo.originCountry,
                                selectedBranch: productInfo.originCountry
                            });
                            productsAddedCount++;
                            messages.push(`"${productInfo.description}" adicionado.`);
                        }
                    } else {
                        messages.push(`Formato inválido ou produto/quantidade não encontrado para: "${itemString}".`);
                        productsSkippedCount++;
                    }
                } else {
                    messages.push(`Formato inválido para: "${itemString}". Esperado "CODIGO,QUANTIDADE".`);
                    productsSkippedCount++;
                }
            });

            renderProductList();
            pasteCodesTextarea.value = '';

            let finalMessage = `${productsAddedCount} produto(s) processado(s) com sucesso.`;
            if (productsSkippedCount > 0) {
                finalMessage += ` ${productsSkippedCount} item(ns) ignorado(s).`;
            }
            displayAddProductMessage(messages.join('<br>') || finalMessage, productsSkippedCount > 0 ? 'warning' : 'success');
        }

        function downloadSpreadsheetModel() {
            const csvContent = "data:text/csv;charset=utf-8,CodigoCliente,Quantidade\nSKU-001,10\nSKU-003,5\n";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "modelo_planilha_fluig.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            displayAddProductMessage('Modelo de planilha baixado com sucesso!', 'success');
        }

        // Function to open the flowchart modal
        function openFlowchartModal() {
            document.getElementById('flowchartModal').classList.add('active');
        }

        // Function to close the flowchart modal
        function closeFlowchartModal() {
            document.getElementById('flowchartModal').classList.remove('active');
        }

        document.addEventListener('DOMContentLoaded', () => {
            orders.forEach(order => {
                if (order.supplier) {
                    getOrGenerateSupplierCode(order.supplier);
                }
            });
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
            
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            showScreen('login-page');

            const loginButton = document.getElementById('loginButton');
            if (loginButton) {
                loginButton.addEventListener('click', login);
            }

            const novaSolicitacaoButton = document.getElementById('novaSolicitacao');
            if (novaSolicitacaoButton) {
                novaSolicitacaoButton.addEventListener('click', () => showScreen('newOrderFormScreen'));
            }

            // Moved logout buttons to header and updated event listeners
            const logoutButtonCentralPedidos = document.getElementById('logoutButton');
            if (logoutButtonCentralPedidos) {
                logoutButtonCentralPedidos.addEventListener('click', logout);
            }

            const purchasingLogoutButton = document.getElementById('purchasingLogoutButton');
            if (purchasingLogoutButton) {
                purchasingLogoutButton.addEventListener('click', logout);
            }

            const renatoLogoutButton = document.getElementById('renatoLogoutButton');
            if (renatoLogoutButton) {
                renatoLogoutButton.addEventListener('click', logout);
            }
        });
