const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan, price, userId, userName, userEmail } = await req.json();

    if (!plan || !price || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if Asaas API key is configured (would come from secrets in production)
    const asaasApiKey = Deno.env.get("ASAAS_API_KEY");

    if (asaasApiKey) {
      // Real Asaas integration
      const customerRes = await fetch("https://api.asaas.com/v3/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: asaasApiKey,
        },
        body: JSON.stringify({
          name: userName || "Cliente Agendify",
          email: userEmail,
          externalReference: userId,
        }),
      });

      const customer = await customerRes.json();
      const customerId = customer.id;

      // Create PIX payment
      const paymentRes = await fetch("https://api.asaas.com/v3/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          access_token: asaasApiKey,
        },
        body: JSON.stringify({
          customer: customerId,
          billingType: "PIX",
          value: price,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          description: `Agendify - Plano ${plan}`,
          externalReference: `${userId}-${plan}`,
        }),
      });

      const payment = await paymentRes.json();

      // Get PIX QR Code
      const pixRes = await fetch(`https://api.asaas.com/v3/payments/${payment.id}/pixQrCode`, {
        headers: { access_token: asaasApiKey },
      });

      const pixData = await pixRes.json();

      return new Response(
        JSON.stringify({
          pixCode: pixData.payload || pixData.encodedImage,
          qrCodeImage: pixData.encodedImage,
          paymentId: payment.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback: no API key configured
    return new Response(
      JSON.stringify({ fallback: true, message: "Asaas API key not configured" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
