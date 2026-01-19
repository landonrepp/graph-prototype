using Kusto.Data;
using Kusto.Data.Net.Client;
using System.Data;

namespace GraphApp;

public class KustoService
{
    private readonly ILogger<KustoService> _logger;

    public KustoService(ILogger<KustoService> logger)
    {
        _logger = logger;
    }

    public async Task<(List<Node>, List<Link>)> GetStormEventsGraphData()
    {
        var nodes = new List<Node>();
        var links = new List<Link>();

        try
        {
            const string cluster = "https://help.kusto.windows.net";
            const string database = "Samples";
            
            var kcsb = new KustoConnectionStringBuilder(cluster)
            {
                InitialCatalog = database
            };
            kcsb = kcsb.WithAadUserPromptAuthentication();


            using var queryProvider = KustoClientFactory.CreateCslQueryProvider(kcsb);
            const string query = "StormEvents | where BeginLocation <> EndLocation | summarize count() by BeginLocation, EndLocation | take 100";

            using var reader = await queryProvider.ExecuteQueryAsync(database, query, null);
            while (reader.Read())
            {
                var beginLocation = reader.GetString(0);
                var endLocation = reader.GetString(1);
                var count = reader.GetInt64(2); // Assuming count is the third column and an Int64

                if (!string.IsNullOrEmpty(beginLocation) && !string.IsNullOrEmpty(endLocation))
                {
                    if (nodes.All(n => n.Id != beginLocation))
                    {
                        nodes.Add(new Node { Id = beginLocation });
                    }

                    if (nodes.All(n => n.Id != endLocation))
                    {
                        nodes.Add(new Node { Id = endLocation });
                    }

                    links.Add(new Link { Source = beginLocation, Target = endLocation, Label = count.ToString() + " storm(s)", Weight = (int)count });
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get data from Kusto.");
        }


        return (nodes, links);
    }
}

public class Node
{
    public string Id { get; set; }
}

public class Link
{
    public string Source { get; set; }
    public string Target { get; set; }
    public string Label { get; set; }
    public int Weight { get; set; }
}
