namespace GraphApp;

public class GraphStateService
{
    public List<string> AllCities { get; private set; } = new();
    public List<string> SelectedCities { get; private set; } = new();
    public string? LastSelectedCity { get; private set; }
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
            var firstCity = AllCities.First();
            SelectedCities.Add(firstCity);
            LastSelectedCity = firstCity;
        }
        NotifyStateChanged();
    }

    public void ToggleCitySelection(string city)
    {
        if (SelectedCities.Contains(city))
        {
            SelectedCities.Remove(city);
            LastSelectedCity = SelectedCities.LastOrDefault();
        }
        else
        {
            SelectedCities.Add(city);
            LastSelectedCity = city;
        }
        NotifyStateChanged();
    }

    public void SelectCity(string city)
    {
        bool changed = false;
        if (!SelectedCities.Contains(city))
        {
            SelectedCities.Add(city);
            changed = true;
        }

        if (LastSelectedCity != city)
        {
            LastSelectedCity = city;
            changed = true;
        }

        if (changed)
        {
            NotifyStateChanged();
        }
    }

    public void ToggleSelectAll()
    {
        if (SelectedCities.Count == AllCities.Count)
        {
            SelectedCities.Clear();
            LastSelectedCity = null;
        }
        else
        {
            SelectedCities = new List<string>(AllCities);
            LastSelectedCity = SelectedCities.LastOrDefault();
        }
        NotifyStateChanged();
    }

    private void NotifyStateChanged() => OnChange?.Invoke();
}
