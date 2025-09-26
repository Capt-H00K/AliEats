import { Router } from 'express';
import { z } from 'zod';
import { 
  insertLedgerEntrySchema, 
  selectLedgerEntrySchema,
  insertSettlementSchema,
  selectSettlementSchema,
  type LedgerEntry,
  type InsertLedgerEntry,
  type Settlement,
  type InsertSettlement
} from '@shared/schema';

const router = Router();

// Validation schemas
const createLedgerEntrySchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  orderId: z.string().optional(),
  type: z.enum(['earning', 'fee', 'settlement', 'debt']),
  amount: z.number(),
  description: z.string().min(1, 'Description is required'),
  metadata: z.object({
    feeType: z.string().optional(),
    settlementId: z.string().optional(),
    notes: z.string().optional(),
  }).optional(),
});

const createSettlementSchema = z.object({
  driverId: z.string().min(1, 'Driver ID is required'),
  amount: z.number().positive('Settlement amount must be positive'),
  settledEntries: z.array(z.string()).min(1, 'At least one ledger entry must be settled'),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

// Get ledger entries for a driver
router.get('/driver/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { 
      type, 
      settled, 
      page = 1, 
      limit = 50,
      startDate,
      endDate 
    } = req.query;

    // TODO: Use actual database storage
    // const entries = await storage.getLedgerEntries({
    //   driverId,
    //   type: type as string,
    //   settled: settled === 'true',
    //   page: Number(page),
    //   limit: Number(limit),
    //   startDate: startDate ? new Date(startDate as string) : undefined,
    //   endDate: endDate ? new Date(endDate as string) : undefined,
    // });

    // For now, return mock data
    const mockEntries: LedgerEntry[] = [
      {
        id: 'ledger-1',
        driverId,
        orderId: 'order-1',
        type: 'earning',
        amount: '15.50',
        description: 'Delivery fee for order #1234',
        isSettled: false,
        settledAt: null,
        metadata: {
          feeType: 'delivery',
          notes: 'Base delivery fee + tip',
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: 'ledger-2',
        driverId,
        orderId: 'order-2',
        type: 'earning',
        amount: '12.25',
        description: 'Delivery fee for order #1235',
        isSettled: false,
        settledAt: null,
        metadata: {
          feeType: 'delivery',
          notes: 'Base delivery fee',
        },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: 'ledger-3',
        driverId,
        type: 'fee',
        amount: '-5.00',
        description: 'Platform fee deduction',
        isSettled: false,
        settledAt: null,
        metadata: {
          feeType: 'platform',
          notes: 'Weekly platform fee',
        },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      },
      {
        id: 'ledger-4',
        driverId,
        type: 'debt',
        amount: '-25.00',
        description: 'Fuel advance',
        isSettled: false,
        settledAt: null,
        metadata: {
          notes: 'Fuel advance payment',
        },
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: 'ledger-5',
        driverId,
        type: 'settlement',
        amount: '150.00',
        description: 'Weekly settlement payment',
        isSettled: true,
        settledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        metadata: {
          settlementId: 'settlement-1',
          notes: 'Bank transfer',
        },
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ];

    // Apply filters
    let filteredEntries = mockEntries;

    if (type) {
      filteredEntries = filteredEntries.filter(entry => entry.type === type);
    }

    if (settled !== undefined) {
      const isSettled = settled === 'true';
      filteredEntries = filteredEntries.filter(entry => entry.isSettled === isSettled);
    }

    if (startDate) {
      const start = new Date(startDate as string);
      filteredEntries = filteredEntries.filter(entry => entry.createdAt >= start);
    }

    if (endDate) {
      const end = new Date(endDate as string);
      filteredEntries = filteredEntries.filter(entry => entry.createdAt <= end);
    }

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        entries: paginatedEntries,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredEntries.length,
          totalPages: Math.ceil(filteredEntries.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get ledger entries error:', error);
    res.status(500).json({
      error: 'Failed to get ledger entries',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create ledger entry
router.post('/entry', async (req, res) => {
  try {
    const validatedData = createLedgerEntrySchema.parse(req.body);
    
    const ledgerEntryData: InsertLedgerEntry = {
      ...validatedData,
      amount: validatedData.amount.toString(),
      isSettled: false,
    };

    // TODO: Use actual database storage
    // const entry = await storage.createLedgerEntry(ledgerEntryData);
    
    // For now, return mock data
    const mockEntry: LedgerEntry = {
      id: 'ledger-' + Date.now(),
      ...ledgerEntryData,
      settledAt: null,
      createdAt: new Date(),
    };

    // Update driver's current debt if this is a debt entry
    if (validatedData.type === 'debt' || validatedData.type === 'fee') {
      // TODO: Update driver's currentDebt field
      // await storage.updateDriverDebt(validatedData.driverId, validatedData.amount);
    }

    res.status(201).json({
      success: true,
      data: mockEntry,
    });
  } catch (error) {
    console.error('Create ledger entry error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create ledger entry',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get driver balance summary
router.get('/balance/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    
    // TODO: Use actual database storage
    // const balance = await storage.getDriverBalance(driverId);
    
    // For now, return mock data
    const mockBalance = {
      driverId,
      totalEarnings: 1247.50,
      totalFees: -89.25,
      totalDebts: -45.50,
      totalSettlements: -950.00,
      currentBalance: 162.75,
      pendingSettlement: 162.75,
      breakdown: {
        unsettledEarnings: 187.25,
        unsettledFees: -24.50,
        unsettledDebts: 0,
        netUnsettled: 162.75,
      },
      lastSettlement: {
        id: 'settlement-1',
        amount: 150.00,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    };

    res.json({
      success: true,
      data: mockBalance,
    });
  } catch (error) {
    console.error('Get driver balance error:', error);
    res.status(500).json({
      error: 'Failed to get driver balance',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create settlement
router.post('/settlement', async (req, res) => {
  try {
    const validatedData = createSettlementSchema.parse(req.body);
    
    const settlementData: InsertSettlement = {
      ...validatedData,
      amount: validatedData.amount.toString(),
      settledEntries: validatedData.settledEntries,
    };

    // TODO: Use actual database storage
    // const settlement = await storage.createSettlement(settlementData);
    
    // For now, return mock data
    const mockSettlement: Settlement = {
      id: 'settlement-' + Date.now(),
      ...settlementData,
      createdAt: new Date(),
    };

    // Mark ledger entries as settled
    // TODO: Update ledger entries to mark them as settled
    // await storage.markEntriesAsSettled(validatedData.settledEntries, mockSettlement.id);

    res.status(201).json({
      success: true,
      data: mockSettlement,
    });
  } catch (error) {
    console.error('Create settlement error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
      });
    }

    res.status(500).json({
      error: 'Failed to create settlement',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get settlements for a driver
router.get('/settlements/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // TODO: Use actual database storage
    // const settlements = await storage.getDriverSettlements(driverId, {
    //   page: Number(page),
    //   limit: Number(limit),
    // });

    // For now, return mock data
    const mockSettlements: Settlement[] = [
      {
        id: 'settlement-1',
        driverId,
        amount: '150.00',
        settledEntries: ['ledger-5', 'ledger-6', 'ledger-7'],
        paymentMethod: 'Bank Transfer',
        paymentReference: 'TXN123456789',
        notes: 'Weekly settlement',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'settlement-2',
        driverId,
        amount: '89.50',
        settledEntries: ['ledger-8', 'ledger-9'],
        paymentMethod: 'PayPal',
        paymentReference: 'PP987654321',
        notes: 'Mid-week settlement',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ];

    // Pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedSettlements = mockSettlements.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        settlements: paginatedSettlements,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: mockSettlements.length,
          totalPages: Math.ceil(mockSettlements.length / Number(limit)),
        },
      },
    });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({
      error: 'Failed to get settlements',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get settlement details
router.get('/settlement/:settlementId', async (req, res) => {
  try {
    const { settlementId } = req.params;
    
    // TODO: Use actual database storage
    // const settlement = await storage.getSettlementById(settlementId);
    
    // For now, return mock data
    const mockSettlement = {
      id: settlementId,
      driverId: 'driver-1',
      amount: '150.00',
      settledEntries: ['ledger-5', 'ledger-6', 'ledger-7'],
      paymentMethod: 'Bank Transfer',
      paymentReference: 'TXN123456789',
      notes: 'Weekly settlement',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      entries: [
        {
          id: 'ledger-5',
          type: 'earning',
          amount: '85.50',
          description: 'Delivery earnings',
          createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'ledger-6',
          type: 'earning',
          amount: '72.25',
          description: 'Delivery earnings',
          createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        },
        {
          id: 'ledger-7',
          type: 'fee',
          amount: '-7.75',
          description: 'Platform fee',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    };

    res.json({
      success: true,
      data: mockSettlement,
    });
  } catch (error) {
    console.error('Get settlement details error:', error);
    res.status(500).json({
      error: 'Failed to get settlement details',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get earnings summary for all drivers (admin only)
router.get('/summary/all', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { period = 'week' } = req.query;
    
    // TODO: Use actual database storage
    // const summary = await storage.getEarningsSummary(period as string);
    
    // For now, return mock data
    const mockSummary = {
      period,
      totalDrivers: 25,
      activeDrivers: 18,
      totalEarnings: 12450.75,
      totalFees: -1245.50,
      totalDebts: -567.25,
      totalSettlements: -9875.00,
      pendingSettlements: 763.00,
      topDrivers: [
        {
          driverId: 'driver-1',
          name: 'John Driver',
          earnings: 847.50,
          deliveries: 42,
          rating: '4.8',
        },
        {
          driverId: 'driver-2',
          name: 'Jane Delivery',
          earnings: 723.25,
          deliveries: 38,
          rating: '4.9',
        },
        {
          driverId: 'driver-3',
          name: 'Mike Transport',
          earnings: 689.75,
          deliveries: 35,
          rating: '4.7',
        },
      ],
      recentActivity: [
        {
          type: 'settlement',
          driverId: 'driver-1',
          driverName: 'John Driver',
          amount: 150.00,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          type: 'earning',
          driverId: 'driver-2',
          driverName: 'Jane Delivery',
          amount: 15.50,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ],
    };

    res.json({
      success: true,
      data: mockSummary,
    });
  } catch (error) {
    console.error('Get earnings summary error:', error);
    res.status(500).json({
      error: 'Failed to get earnings summary',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Process automatic settlement for a driver
router.post('/auto-settle/:driverId', async (req, res) => {
  try {
    const { driverId } = req.params;
    const { minAmount = 50 } = req.body;
    
    // TODO: Use actual database storage
    // const result = await storage.processAutoSettlement(driverId, minAmount);
    
    // For now, return mock result
    const mockResult = {
      processed: true,
      settlementId: 'settlement-' + Date.now(),
      amount: 162.75,
      entriesSettled: 8,
      message: 'Auto-settlement processed successfully',
    };

    res.json({
      success: true,
      data: mockResult,
    });
  } catch (error) {
    console.error('Auto settlement error:', error);
    res.status(500).json({
      error: 'Failed to process auto settlement',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;