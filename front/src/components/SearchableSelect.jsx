import Select from "react-select";

function SearchableSelect({
  options = [],
  value,
  onChange,
  isInvalid = false,
  isDisabled = false,
  placeholder = "Seleccionar...",
  getOptionDisabled = () => false,
}) {
  const formattedOptions = options.map(opt => ({
    value: opt._id,
    label: opt.gp_name || opt.name,
    timezone: opt.timezone,
    isDisabled: getOptionDisabled(opt),
    original: opt, // por si luego querés más datos
    teamName: opt.team?.name || "" // Store for custom filtering
  }));

  const currentValue = formattedOptions.find(o => o.value === value) || null;

  return (
    <Select
      className={`react-select-container ${isInvalid ? "is-invalid" : ""}`}
      classNamePrefix="react-select"
      value={currentValue}
      onChange={(selected) => onChange(selected)}
      options={formattedOptions}
      isSearchable={true}
      isDisabled={isDisabled}
      isOptionDisabled={(opt) => opt.isDisabled}
      placeholder={placeholder}
      menuPortalTarget={document.body}
      menuPlacement="auto"
      blurInputOnSelect={true}
      openMenuOnFocus={true}
      filterOption={(option, inputValue) => {
        const label = option.label.toLowerCase();
        const team = (option.data.teamName || "").toLowerCase();
        const search = inputValue.toLowerCase();
        return label.includes(search) || team.includes(search);
      }}
      styles={{
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({ ...base, color: '#333' }), // Ensure menu text is visible
        control: (base) => ({ ...base, minHeight: '32px' }),
      }}
    />
  );
}

export default SearchableSelect;
