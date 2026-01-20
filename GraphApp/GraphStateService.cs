namespace GraphApp;

public class GraphStateService
{
    public List<string> AllCities { get; private set; } = new();
    public List<string> SelectedCities { get; private set; } = new();
    public List<Node> Nodes { get; private set; } = new();
    public List<Link> Links { get; private set; } = new();

    public event Action? OnChange;

    private readonly KustoService _kustoService;

    public GraphStateService(KustoService kustoService)
    {
        _kustoService = kustoService;
    }

    public async Task InitializeAsync()
    {
        (Nodes, Links) = await _kustoService.GetStormEventsGraphData();
        AllCities = Nodes.Select(n => n.Id).Distinct().OrderBy(c => c).ToList();
        if (AllCities.Any())
        {
            SelectedCities.Add(AllCities.First());
        }
        NotifyStateChanged();
    }

    public void ToggleCitySelection(string city)
    {
        if (SelectedCities.Contains(city))
        {
            SelectedCities.Remove(city);
        }
        else
        {
            SelectedCities.Add(city);
        }
        NotifyStateChanged();
    }

    public void SelectCity(string city)
    {
        if (!SelectedCities.Contains(city))
        {
            SelectedCities.Add(city);
            NotifyStateChanged();
        }
    }

    private void NotifyStateChanged() => OnChange?.Invoke();
}
