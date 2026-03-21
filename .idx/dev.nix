{ pkgs, ... }: {
  # Which packages to install in your environment
  channel = "stable-24.11";
  packages = [
    pkgs.nodejs_22
    pkgs.nodePackages.firebase-tools
    pkgs.nodePackages."@angular/cli"
  ];

  # This section enables the Web Preview
  idx = {
    extensions = [
      "angular.ng-template"
    ];
    previews = {
      enable = true;
      previews = {
       # Inside .idx/dev.nix
      web = {
         command = [
          "npm"
          "run"
          "start"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
          "--allowed-hosts"
        ];
        manager = "web";
      };
      };
    };
  };
}