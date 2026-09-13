export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { reference } = req.body

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    )

    const data = await response.json()

    if (data.data.status === 'success') {
      return res.status(200).json({ status: true, data: data.data })
    } else {
      return res.status(200).json({ status: false })
    }
  } catch (error: any) {
    return res.status(500).json({ status: false, error: error.message })
  }
}